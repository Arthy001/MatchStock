#!/usr/bin/env node
/**
 * Self-service "clear my test tenant's data" tool for DevOps - no VM/SSH
 * access needed, just a normal login. Logs in with the given email/password,
 * shows a dry-run row-count preview from POST /dev-tools/reset-my-tenant-data
 * on the real backend (match-stock.ddns.net), then (after confirmation)
 * deletes it for real over plain HTTPS.
 *
 * Only works for tenants explicitly allowlisted server-side by the backend
 * team - everyone else gets a 404 as if the endpoint doesn't exist. Ask the
 * backend team to add your tenant if this script reports "endpoint not found".
 *
 * Requires Node.js 18+ (uses the built-in fetch). No install/dependencies
 * needed - just run the file directly:
 *
 *   node reset-tenant-data.js --email you@example.com --password 'yourPassword' [--url https://match-stock.ddns.net] [--yes]
 *
 *   --url   API base URL. Defaults to production. Pass http://localhost:3010 for local Docker.
 *   --yes   Skip the interactive "are you sure" prompt (still requires the dry-run to have found rows).
 */
const readline = require('node:readline/promises');

function parseArgs(argv) {
  const args = { url: 'https://match-stock.ddns.net', yes: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--email') args.email = argv[++i];
    else if (arg === '--password') args.password = argv[++i];
    else if (arg === '--url') args.url = argv[++i];
    else if (arg === '--yes') args.yes = true;
  }
  return args;
}

async function apiPost(baseUrl, path, body, token) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

function printTable(rows) {
  const nonZero = rows.filter((r) => r.rowsToDelete > 0);
  if (nonZero.length === 0) {
    console.log('  (nothing to delete)');
    return;
  }
  for (const row of nonZero) {
    console.log(`  ${row.table.padEnd(24)} ${row.rowsToDelete}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.email || !args.password) {
    console.error('Usage: node reset-tenant-data.js --email you@example.com --password \'yourPassword\' [--url https://match-stock.ddns.net] [--yes]');
    process.exit(1);
  }

  console.log(`Logging in as ${args.email} at ${args.url} ...`);
  const login = await apiPost(args.url, '/api/v1/auth/login', { email: args.email, password: args.password });
  if (login.status !== 200 && login.status !== 201) {
    console.error(`Login failed (HTTP ${login.status}): ${login.json?.errors?.[0] ?? login.json?.message ?? 'unknown error'}`);
    process.exit(1);
  }
  const token = login.json?.data?.accessToken;
  if (!token) {
    console.error('Login succeeded but no access token was returned - unexpected response shape.');
    process.exit(1);
  }

  console.log('Fetching dry-run preview ...');
  const preview = await apiPost(args.url, '/api/v1/dev-tools/reset-my-tenant-data', {}, token);
  if (preview.status === 404) {
    console.error('This account\'s tenant is not enabled for self-service reset. Ask the backend team to add your tenant ID to the reset allowlist.');
    process.exit(1);
  }
  if (preview.status === 403) {
    console.error('Only the tenant owner account can reset data. Log in with your owner account instead.');
    process.exit(1);
  }
  if (preview.status !== 200 && preview.status !== 201) {
    console.error(`Preview failed (HTTP ${preview.status}): ${preview.json?.errors?.[0] ?? preview.json?.message ?? 'unknown error'}`);
    process.exit(1);
  }

  const data = preview.json.data;
  console.log(`\nThe following data would be permanently deleted from this tenant (${data.totalRows} row(s) total):`);
  printTable(data.byTable);

  if (data.totalRows === 0) {
    console.log('\nNothing to reset.');
    return;
  }

  if (!args.yes) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question('\nType "yes" to permanently delete this data: ');
    rl.close();
    if (answer.trim().toLowerCase() !== 'yes') {
      console.log('Cancelled - nothing was deleted.');
      return;
    }
  }

  console.log('Deleting ...');
  const result = await apiPost(args.url, '/api/v1/dev-tools/reset-my-tenant-data', { confirm: 'RESET' }, token);
  if (result.status !== 200 && result.status !== 201) {
    console.error(`Reset failed (HTTP ${result.status}): ${result.json?.errors?.[0] ?? result.json?.message ?? 'unknown error'}`);
    process.exit(1);
  }

  console.log(`\nDone. Deleted ${result.json.data.totalRows} row(s):`);
  printTable(result.json.data.byTable);
  console.log('\nYour login and subscription are unaffected - log in as usual to start testing with a clean slate.');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

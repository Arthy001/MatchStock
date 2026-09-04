import React, { useState } from 'react';
import {
  Package,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Mail,
  Sun,
  Moon,
  AlertCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  Check,
  Layers,
  Activity,
  Zap,
} from 'lucide-react';
import { Language, ThemeMode, Tenant, User } from '../types';
import { getTranslation } from '../i18n';
import { authService } from '../services/auth.service';

interface LoginViewProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
  tenants: Tenant[];
  onLoginSuccess: (user: User) => void;
}

interface DemoAccount {
  tenantName: string;
  email: string;
  role: string;
  badge: string;
  password?: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    tenantName: 'Siam Foods (Free Plan)',
    email: 'owner@siamfoods.demo',
    role: 'Siam Foods',
    badge: 'Free Plan',
    password: 'Demo1234!',
  },
  {
    tenantName: 'Thai Electronics (Pro Plan)',
    email: 'owner@thaielec.demo',
    role: 'Thai Electronics',
    badge: 'Pro Plan',
    password: 'Demo1234!',
  },
  {
    tenantName: 'Green Farm (Ultra Plan)',
    email: 'owner@greenfarm.demo',
    role: 'Green Farm',
    badge: 'Ultra Plan',
    password: 'Demo1234!',
  },
  {
    tenantName: 'MatchStock Demo (Enterprise)',
    email: 'admin@matchstock.com',
    role: 'Admin',
    badge: 'Enterprise',
    password: 'Passw0rd!',
  },
  {
    tenantName: 'MatchStock Demo (Enterprise)',
    email: 'manager@matchstock.com',
    role: 'Manager',
    badge: 'Operations',
    password: 'Passw0rd!',
  },
  {
    tenantName: 'MatchStock Demo (Enterprise)',
    email: 'whstaff@matchstock.com',
    role: 'Warehouse Staff',
    badge: 'Inventory',
    password: 'Passw0rd!',
  },
  {
    tenantName: 'MatchStock Demo (Enterprise)',
    email: 'purchasing@matchstock.com',
    role: 'Purchasing Staff',
    badge: 'Procurement',
    password: 'Passw0rd!',
  },
];

export const LoginView: React.FC<LoginViewProps> = ({
  lang,
  onLanguageChange,
  theme,
  onThemeToggle,
  tenants,
  onLoginSuccess,
}) => {
  const t = getTranslation(lang);
  const [email, setEmail] = useState('owner@siamfoods.demo');
  const [password, setPassword] = useState('Demo1234!');
  const [showPassword, setShowPassword] = useState(false);
  const [keepConnected, setKeepConnected] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDemoIndex, setSelectedDemoIndex] = useState<number>(0);

  const isDark = theme === 'dark';

  const handleSelectDemo = (account: DemoAccount, index: number) => {
    setSelectedDemoIndex(index);
    setEmail(account.email);
    setPassword(account.password || 'Demo1234!');
    setErrorMsg('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // 1. ยิง Login ไปยัง Live Backend API (Strict Mode)
      const res = await authService.login({
        email: email.trim(),
        password: password,
      });

      if (res && res.success) {
        const userObj = res.user || res.data?.user;
        const tenantObj = res.tenant || res.data?.tenant;

        if (userObj) {
          const loggedUser: User = {
            id: userObj.id,
            name: userObj.fullName || userObj.email.split('@')[0],
            email: userObj.email,
            role: (userObj.role as any) || 'admin',
            tenantId: userObj.tenantId || (userObj as any).tenant_id || tenantObj?.id || '',
            tenantName: tenantObj?.name || 'MatchStock Tenant',
          };
          onLoginSuccess(loggedUser);
          return;
        }
      }
      setErrorMsg(res?.message || (lang === 'en' ? 'Authentication failed. Please check credentials.' : 'เข้าสู่ระบบไม่สำเร็จ ข้อมูลไม่ถูกต้อง'));
    } catch (err: any) {
      console.error('Strict Login Error from Backend API:', err.response?.data || err.message);
      const status = err.response?.status;
      const apiErrMsg = err.response?.data?.message || err.response?.data?.error || err.response?.data?.errors?.[0];

      if (status === 400) {
        setErrorMsg(apiErrMsg || (lang === 'en'
          ? 'Invalid request (400): Missing required fields or invalid format.'
          : 'ข้อมูลคำขอไม่ถูกต้อง (400 Bad Request): กรุณาตรวจสอบข้อมูลที่กรอก'));
      } else if (status === 500) {
        setErrorMsg(lang === 'en' 
          ? 'Backend Server Error (500): Database connection or internal server failure.' 
          : 'เซิร์ฟเวอร์หลังบ้านขัดข้อง (500 Internal Server Error): ฐานข้อมูลหรือระบบ Backend มีปัญหา');
      } else if (status === 401 || status === 403) {
        setErrorMsg(lang === 'en'
          ? 'Invalid email or password (401 Unauthorized).'
          : 'อีเมลหรือรหัสผ่านไม่ถูกต้อง (401 Unauthorized)');
      } else if (status === 404) {
        setErrorMsg(lang === 'en'
          ? 'Tenant or User not found (404).'
          : 'ไม่พบบัญชีผู้ใช้หรือ Tenant นี้ในระบบ (404)');
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setErrorMsg(lang === 'en'
          ? 'Network Error: Cannot connect to Backend Server (match-stock.ddns.net).'
          : 'ข้อผิดพลาดเครือข่าย: ไม่สามารถเชื่อมต่อไปยังเซิร์ฟเวอร์หลังบ้านได้ (Server ออฟไลน์)');
      } else {
        setErrorMsg(apiErrMsg || (lang === 'en' ? 'Authentication failed.' : 'เข้าสู่ระบบไม่สำเร็จ'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 transition-colors duration-300 relative overflow-hidden ${
        isDark ? 'text-slate-100' : 'text-slate-900'
      }`}
    >
      {/* 1. Full-Screen Background Image (Smart Automated Warehouse) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url('/images/warehouse-bg.jpg')` }}
      />

      {/* 2. Neutral Cinematic Tint Overlay (Pure Clean Industrial Tone - Zero colored spots) */}
      <div
        className={`absolute inset-0 transition-colors duration-300 backdrop-blur-[3px] ${
          isDark
            ? 'bg-slate-950/85'
            : 'bg-slate-900/60'
        }`}
      />

      {/* 3. Vignette Glow & Depth Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />

      {/* Main 2-Column Floating Card Container */}
      <div
        className={`w-full max-w-5xl rounded-[32px] border shadow-2xl overflow-visible flex flex-col md:flex-row transition-all duration-300 relative z-10 ${
          isDark
            ? 'bg-slate-900/95 border-slate-800 shadow-2xl shadow-black/60 backdrop-blur-md'
            : 'bg-white/95 border-slate-200/80 shadow-2xl shadow-slate-950/40 backdrop-blur-md'
        }`}
      >
        {/* ========================================================= */}
        {/* ADORABLE MASCOT: "น้อง Ottery" Clinging on Vertical Seam */}
        {/* ========================================================= */}
        <div className="hidden md:block absolute left-1/2 top-[38%] -translate-y-1/2 -translate-x-[52px] z-30 select-none pointer-events-auto group">
          {/* Speech Bubble on Hover */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3.5 py-1.5 rounded-2xl bg-slate-900/95 text-white text-[13px] font-bold shadow-2xl border border-slate-700 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 group-hover:translate-y-0 backdrop-blur-md">
            {lang === 'en' ? '🐾 Hi! I am Ottery, ready to manage stock!' : '🐾 สวัสดีครับ! ผมน้อง Ottery พร้อมดูแลสต็อกครับ'}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
          </div>

          {/* Large Cute Side-Peeking Otter Mascot SVG */}
          <svg
            className="w-32 h-44 drop-shadow-2xl transition-transform duration-300 group-hover:scale-105 group-hover:translate-x-1 cursor-pointer"
            viewBox="0 0 140 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Otter Tail / Fluffy Body Behind Seam */}
            <path
              d="M30,110 C15,125 10,155 25,170 C38,175 52,160 48,140 Z"
              fill="#8D5B4C"
            />

            {/* Otter Body */}
            <path
              d="M35,65 C35,65 20,95 25,135 C30,160 55,165 55,165 L55,65 Z"
              fill="#A7745B"
            />
            {/* Cream Tummy */}
            <path
              d="M42,85 C38,105 38,135 52,150 L52,85 Z"
              fill="#FFF2DF"
            />

            {/* Otter Ears */}
            <circle cx="42" cy="42" r="13" fill="#8D5B4C" />
            <circle cx="42" cy="42" r="7" fill="#FBCFE8" />
            <circle cx="95" cy="45" r="13" fill="#8D5B4C" />
            <circle cx="95" cy="45" r="7" fill="#FBCFE8" />

            {/* Otter Head (Tilted Curious Look) */}
            <g transform="rotate(6, 68, 68)">
              {/* Head Base */}
              <ellipse cx="68" cy="65" rx="38" ry="34" fill="#A7745B" />

              {/* Blue Mini Safety Hardhat (MatchStock Brand) */}
              <path
                d="M35,52 C35,26 98,26 98,52 Z"
                fill="#2563EB"
                stroke="#1D4ED8"
                strokeWidth="2.5"
              />
              {/* Hardhat Visor / Brim */}
              <path
                d="M28,52 C28,49 105,49 105,52 L101,57 L32,57 Z"
                fill="#3B82F6"
              />
              {/* Safety Badge */}
              <rect x="62" y="32" width="14" height="12" rx="3" fill="#FACC15" />
              <path d="M65,38 L73,38 M69,34 L69,42" stroke="#854D0E" strokeWidth="2" strokeLinecap="round" />

              {/* Snout Area */}
              <ellipse cx="68" cy="76" rx="22" ry="17" fill="#FFF2DF" />

              {/* Rosy Cheeks */}
              <circle cx="44" cy="75" r="7" fill="#FDA4AF" opacity="0.9" />
              <circle cx="92" cy="77" r="7" fill="#FDA4AF" opacity="0.9" />

              {/* Cute Big Sparkling Eyes (Looking Right Towards Login Form) */}
              <ellipse cx="52" cy="63" rx="6" ry="6.5" fill="#0F172A" />
              <circle cx="54" cy="61" r="2.5" fill="#FFFFFF" />
              <circle cx="50.5" cy="64.5" r="1.2" fill="#FFFFFF" />

              <ellipse cx="84" cy="65" rx="6" ry="6.5" fill="#0F172A" />
              <circle cx="86" cy="63" r="2.5" fill="#FFFFFF" />
              <circle cx="82.5" cy="66.5" r="1.2" fill="#FFFFFF" />

              {/* Cute Nose and Mouth */}
              <ellipse cx="68" cy="71" rx="5" ry="3.5" fill="#0F172A" />
              <path
                d="M61,77 C64,81 68,79 68,76 C68,79 72,81 75,77"
                stroke="#0F172A"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />

              {/* Whiskers */}
              <path d="M40,73 L26,70 M40,77 L25,78" stroke="#8D5B4C" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M96,75 L110,73 M96,79 L111,81" stroke="#8D5B4C" strokeWidth="1.8" strokeLinecap="round" />
            </g>

            {/* Otter Front Paws Clutching the Vertical Divider Edge */}
            {/* Top Paw clutching right at the seam */}
            <g transform="translate(54, 88)">
              <ellipse cx="0" cy="0" rx="12" ry="9" fill="#8D5B4C" />
              <circle cx="6" cy="-4" r="3" fill="#FFF2DF" />
              <circle cx="8" cy="0" r="3" fill="#FFF2DF" />
              <circle cx="6" cy="4" r="3" fill="#FFF2DF" />
              {/* Pink Toe Beans */}
              <circle cx="0" cy="0" r="3.5" fill="#FDA4AF" />
            </g>

            {/* Bottom Paw clutching lower down the seam */}
            <g transform="translate(54, 132)">
              <ellipse cx="0" cy="0" rx="12" ry="9" fill="#8D5B4C" />
              <circle cx="6" cy="-4" r="3" fill="#FFF2DF" />
              <circle cx="8" cy="0" r="3" fill="#FFF2DF" />
              <circle cx="6" cy="4" r="3" fill="#FFF2DF" />
              {/* Pink Toe Beans */}
              <circle cx="0" cy="0" r="3.5" fill="#FDA4AF" />
            </g>
          </svg>
        </div>

        {/* ========================================================= */}
        {/* LEFT COLUMN: 3D Isometric Visual & MatchStock Brand Theme */}
        {/* ========================================================= */}
        <div
          className={`w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-between relative overflow-hidden rounded-t-[32px] md:rounded-tr-none md:rounded-l-[32px] transition-colors ${
            isDark
              ? 'bg-gradient-to-br from-slate-900 via-slate-800/95 to-blue-950/40 text-white border-b md:border-b-0 md:border-r border-slate-800'
              : 'bg-gradient-to-br from-[#1E40AF] via-[#1D4ED8] to-[#0F172A] text-white border-b md:border-b-0 md:border-r border-blue-900/40'
          }`}
        >
          {/* Top Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20 text-white">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-extrabold text-xl tracking-tight leading-none text-white">
                  MATCHSTOCK
                </h1>
                <p className="text-[12px] font-medium tracking-wide mt-1 text-sky-300">
                  INTELLIGENT WMS & CLOUD PLATFORM
                </p>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight uppercase leading-snug mt-4 text-white">
              {lang === 'en' ? 'Welcome, Friend!' : 'ยินดีต้อนรับสู่ระบบ!'}
            </h2>
            <p className="text-[14px] leading-relaxed mt-1.5 line-clamp-3 text-blue-100/90">
              {lang === 'en'
                ? 'High-performance multi-tenant warehouse & inventory platform with real-time FIFO bin tracking and automated reconciliation.'
                : 'แพลตฟอร์มบริหารจัดการคลังสินค้าและสต็อกอัจฉริยะ รองรับหลายบริษัทในเครือ พร้อมระบบติดตาม Lot/FIFO และสแกนเนอร์บาร์โค้ดแบบ Real-time'}
            </p>
          </div>

          {/* Center 3D Isometric SVG Illustration (MatchStock Palette: Blue / Sky / Silver) */}
          <div className="my-6 sm:my-8 flex items-center justify-center relative select-none">
            {/* Background Ambient Aura */}
            <div className="absolute w-64 h-64 bg-sky-400/15 rounded-full blur-2xl pointer-events-none" />

            <svg
              className="w-full max-w-[320px] sm:max-w-[360px] h-auto drop-shadow-2xl"
              viewBox="0 0 400 340"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Gradients for Base Platform */}
                <linearGradient id="pedestalTop" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#1E293B" />
                </linearGradient>
                <linearGradient id="pedestalLeft" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#0F172A" />
                </linearGradient>
                <linearGradient id="pedestalRight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F172A" />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>

                {/* Gradients for Lower Base Cubes (Deep Royal Blue / Cobalt) */}
                <linearGradient id="blueTop" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
                <linearGradient id="blueLeft" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1D4ED8" />
                  <stop offset="100%" stopColor="#1E3A8A" />
                </linearGradient>
                <linearGradient id="blueRight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E3A8A" />
                  <stop offset="100%" stopColor="#172554" />
                </linearGradient>

                {/* Gradients for Upper Ice Silver / Platinum Cubes */}
                <linearGradient id="whiteTop" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#E0E7FF" />
                </linearGradient>
                <linearGradient id="whiteLeft" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C7D2FE" />
                  <stop offset="100%" stopColor="#A5B4FC" />
                </linearGradient>
                <linearGradient id="whiteRight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A5B4FC" />
                  <stop offset="100%" stopColor="#818CF8" />
                </linearGradient>

                {/* Center Floating Accent Cube (Glowing Electric Sky Blue) */}
                <linearGradient id="accentTop" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#0EA5E9" />
                </linearGradient>
                <linearGradient id="accentLeft" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284C7" />
                  <stop offset="100%" stopColor="#0369A1" />
                </linearGradient>
                <linearGradient id="accentRight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#075985" />
                  <stop offset="100%" stopColor="#0C4A6E" />
                </linearGradient>

                {/* Orbital Ring Glow (Electric Sky / White) */}
                <linearGradient id="orbitGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#67E8F9" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* 1. Base Pedestal Platform */}
              <g transform="translate(200, 240)">
                {/* Platform Shadow */}
                <ellipse cx="0" cy="40" rx="140" ry="40" fill="black" fillOpacity="0.3" />

                {/* Platform Extrusion Left */}
                <path d="M-130,0 L0,55 L0,75 L-130,20 Z" fill="url(#pedestalLeft)" />
                {/* Platform Extrusion Right */}
                <path d="M130,0 L0,55 L0,75 L130,20 Z" fill="url(#pedestalRight)" />
                {/* Platform Top Surface */}
                <path d="M0,-55 L130,0 L0,55 L-130,0 Z" fill="url(#pedestalTop)" />

                {/* Inner Recessed Cyber Grid Line */}
                <path d="M0,-42 L100,0 L0,42 L-100,0 Z" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
              </g>

              {/* 2. Outer Orbital Rings (Back Segment) */}
              <path
                d="M50,195 C50,120 350,120 350,195"
                stroke="url(#orbitGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.4"
                fill="none"
              />
              <path
                d="M70,140 C120,70 340,190 330,250"
                stroke="url(#orbitGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.35"
                fill="none"
              />

              {/* 3. Lower 3D Isometric Stack (Royal Blue Base Cubes) */}
              {/* Lower Bottom Cube */}
              <g transform="translate(200, 215)">
                <path d="M0,-35 L50,-10 L0,15 L-50,-10 Z" fill="url(#blueTop)" />
                <path d="M-50,-10 L0,15 L0,55 L-50,30 Z" fill="url(#blueLeft)" />
                <path d="M50,-10 L0,15 L0,55 L50,30 Z" fill="url(#blueRight)" />
              </g>

              {/* Lower Left Silver Cube */}
              <g transform="translate(150, 185)">
                <path d="M0,-30 L45,-7 L0,15 L-45,-7 Z" fill="url(#whiteTop)" />
                <path d="M-45,-7 L0,15 L0,50 L-45,28 Z" fill="url(#whiteLeft)" />
                <path d="M45,-7 L0,15 L0,50 L45,28 Z" fill="url(#whiteRight)" />
              </g>

              {/* Lower Right Silver Cube */}
              <g transform="translate(250, 185)">
                <path d="M0,-30 L45,-7 L0,15 L-45,-7 Z" fill="url(#whiteTop)" />
                <path d="M-45,-7 L0,15 L0,50 L-45,28 Z" fill="url(#whiteLeft)" />
                <path d="M45,-7 L0,15 L0,50 L45,28 Z" fill="url(#whiteRight)" />
              </g>

              {/* 4. Center Floating Accent Cube (Electric Sky Blue Diamond) */}
              <g transform="translate(200, 145)">
                <ellipse cx="0" cy="45" rx="35" ry="12" fill="black" fillOpacity="0.3" />
                <path d="M0,-40 L45,-15 L0,10 L-45,-15 Z" fill="url(#accentTop)" />
                <path d="M-45,-15 L0,10 L0,55 L-45,30 Z" fill="url(#accentLeft)" />
                <path d="M45,-15 L0,10 L0,55 L45,30 Z" fill="url(#accentRight)" />

                {/* Cyber Highlight Lines */}
                <path d="M0,-38 L42,-15" stroke="#E0F2FE" strokeWidth="2" opacity="0.8" />
                <path d="M0,-38 L-42,-15" stroke="#E0F2FE" strokeWidth="2" opacity="0.8" />
              </g>

              {/* 5. Top Backing Silver Cube */}
              <g transform="translate(200, 105)">
                <path d="M0,-30 L40,-8 L0,14 L-40,-8 Z" fill="url(#whiteTop)" />
                <path d="M-40,-8 L0,14 L0,45 L-40,24 Z" fill="url(#whiteLeft)" />
                <path d="M40,-8 L0,14 L0,45 L40,24 Z" fill="url(#whiteRight)" />
              </g>

              {/* 6. Front Orbital Rings (Front Segment) */}
              <path
                d="M50,195 C50,270 350,270 350,195"
                stroke="url(#orbitGrad)"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M70,140 C50,230 290,300 330,250"
                stroke="url(#orbitGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* 7. Orbital Particle Spheres / Satellite Nodes */}
              <circle cx="50" cy="195" r="7" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2.5" />
              <circle cx="340" cy="175" r="6" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="280" cy="272" r="5" fill="#E0E7FF" stroke="#0284C7" strokeWidth="2" />
            </svg>
          </div>

          {/* Bottom Left Feature Badges */}
          <div className="relative z-10 pt-2 border-t border-white/20 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              <span className="font-medium text-sky-200">
                {lang === 'en' ? 'Live Swagger Backend' : 'เชื่อมต่อ Live Backend API'}
              </span>
            </div>
            <div className="px-2.5 py-1 rounded-full font-bold text-[11px] bg-white/15 text-white border border-white/20 backdrop-blur-xs">
              🔒 256-bit AES Encrypted
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Modern Clean Login Form & Controls         */}
        {/* ========================================================= */}
        <div
          className={`w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-between rounded-b-[32px] md:rounded-bl-none md:rounded-r-[32px] relative overflow-visible ${
            isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'
          }`}
        >
          {/* Mobile Seam Mascot: น้อง Ottery Peeking on Horizontal Seam (< md screens) */}
          <div className="md:hidden absolute right-6 -top-14 z-30 select-none pointer-events-auto group">
            {/* Speech Bubble on Tap/Hover */}
            <div className="absolute -top-8 right-0 whitespace-nowrap px-2.5 py-1 rounded-xl bg-slate-900/95 text-white text-[11px] font-bold shadow-xl border border-slate-700 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all duration-200 backdrop-blur-md">
              {lang === 'en' ? '🐾 Ottery here!' : '🐾 น้อง Ottery เองครับ!'}
            </div>

            {/* Mobile Cute Peeking Otter SVG (Full Head + Visible Paws Clutching the Seam) */}
            <svg
              className="w-20 h-20 drop-shadow-2xl transition-transform duration-200 active:scale-110 cursor-pointer"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Ears */}
              <circle cx="34" cy="42" r="11" fill="#8D5B4C" />
              <circle cx="34" cy="42" r="6" fill="#FBCFE8" />
              <circle cx="86" cy="42" r="11" fill="#8D5B4C" />
              <circle cx="86" cy="42" r="6" fill="#FBCFE8" />

              {/* Head */}
              <ellipse cx="60" cy="55" rx="34" ry="30" fill="#A7745B" />

              {/* Blue Helmet */}
              <path d="M32,45 C32,24 88,24 88,45 Z" fill="#2563EB" stroke="#1D4ED8" strokeWidth="2" />
              <path d="M26,45 C26,43 94,43 94,45 L90,49 L30,49 Z" fill="#3B82F6" />
              <rect x="54" y="28" width="12" height="10" rx="3" fill="#FACC15" />
              <path d="M57,33 L63,33 M60,30 L60,36" stroke="#854D0E" strokeWidth="2" strokeLinecap="round" />

              {/* Snout */}
              <ellipse cx="60" cy="65" rx="20" ry="15" fill="#FFF2DF" />
              <circle cx="38" cy="64" r="5.5" fill="#FDA4AF" opacity="0.85" />
              <circle cx="82" cy="64" r="5.5" fill="#FDA4AF" opacity="0.85" />

              {/* Sparkling Eyes */}
              <circle cx="46" cy="53" r="5" fill="#1E293B" />
              <circle cx="44.5" cy="51.5" r="2" fill="#FFFFFF" />
              <circle cx="74" cy="53" r="5" fill="#1E293B" />
              <circle cx="72.5" cy="51.5" r="2" fill="#FFFFFF" />

              {/* Nose & Smile */}
              <ellipse cx="60" cy="61" rx="4" ry="3" fill="#1E293B" />
              <path d="M54,66 C56,69 60,68 60,65 C60,68 64,69 66,66" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />

              {/* Large Paws Clutching Over the Horizontal Seam */}
              <g transform="translate(0, 5)">
                {/* Left Paw */}
                <ellipse cx="36" cy="80" rx="11" ry="10" fill="#8D5B4C" />
                <circle cx="30" cy="84" r="3" fill="#FFF2DF" />
                <circle cx="36" cy="85" r="3" fill="#FFF2DF" />
                <circle cx="42" cy="84" r="3" fill="#FFF2DF" />
                <circle cx="36" cy="79" r="3" fill="#FDA4AF" />

                {/* Right Paw */}
                <ellipse cx="84" cy="80" rx="11" ry="10" fill="#8D5B4C" />
                <circle cx="78" cy="84" r="3" fill="#FFF2DF" />
                <circle cx="84" cy="85" r="3" fill="#FFF2DF" />
                <circle cx="90" cy="84" r="3" fill="#FFF2DF" />
                <circle cx="84" cy="79" r="3" fill="#FDA4AF" />
              </g>
            </svg>
          </div>
          {/* Top Bar Right: Language & Theme Switchers */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
                {lang === 'en' ? 'LOGIN' : 'เข้าสู่ระบบ'}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {/* ISO Segmented Language Toggle [ TH | EN ] */}
              <div
                className={`flex items-center p-0.5 rounded-xl border text-xs font-bold transition ${
                  isDark
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-slate-100 border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onLanguageChange('th')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    lang === 'th'
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  TH
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange('en')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    lang === 'en'
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Theme Switcher */}
              <button
                type="button"
                onClick={onThemeToggle}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
                title={isDark ? t.lightMode : t.darkMode}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick 1-Click Test Accounts (Pill Badges) */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {lang === 'en' ? 'Quick 1-Click Demo Accounts' : 'เลือกบัญชีทดสอบด่วน (1-Click Fill)'}
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc, idx) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelectDemo(acc, idx)}
                  className={`p-2 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                    selectedDemoIndex === idx
                      ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                      : isDark
                      ? 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-300'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold truncate">{acc.role}</span>
                      {acc.badge && (
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded shrink-0 ${
                            acc.badge.includes('Free')
                              ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                              : acc.badge.includes('Pro')
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : acc.badge.includes('Ultra')
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {acc.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate font-mono mt-0.5">
                      {acc.email}
                    </p>
                  </div>
                  {selectedDemoIndex === idx && (
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-[14px] font-semibold mb-1.5 text-slate-700 dark:text-slate-200">
                {lang === 'en' ? 'Email Address' : 'อีเมลผู้ใช้งาน (Email)'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@matchstock.com"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-[15px] font-medium outline-hidden transition ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                  }`}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[14px] font-semibold text-slate-700 dark:text-slate-200">
                  {t.password}
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(lang === 'en' ? 'Default demo password is: Passw0rd!' : 'รหัสผ่านเริ่มต้นของ Demo คือ: Passw0rd!');
                  }}
                  className="text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {lang === 'en' ? 'Forgot Password?' : 'ลืมรหัสผ่าน?'}
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Passw0rd!"
                  required
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-[15px] font-medium outline-hidden transition ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title={showPassword ? (lang === 'en' ? 'Hide Password' : 'ซ่อนรหัสผ่าน') : (lang === 'en' ? 'Show Password' : 'แสดงรหัสผ่าน')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Keep Connected Checkbox */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="keepConnected"
                checked={keepConnected}
                onChange={(e) => setKeepConnected(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="keepConnected" className="text-[13px] font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                {lang === 'en' ? 'Keep Connected' : 'จดจำการเข้าสู่ระบบในเครื่องนี้'}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 disabled:opacity-50 text-white font-semibold text-[15px] shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === 'en' ? 'Authenticating with Backend...' : 'กำลังเข้าสู่ระบบผ่าน Live API...'}</span>
                </>
              ) : (
                <>
                  <span>{t.loginBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Notice */}
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-400">
              MatchStock Enterprise WMS • Live Swagger API:{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-mono text-[10px]">
                https://match-stock.ddns.net/api/v1
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


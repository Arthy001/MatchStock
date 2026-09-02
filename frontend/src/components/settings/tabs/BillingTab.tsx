import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Crown,
  CheckCircle2,
  Sparkles,
  Users,
  Warehouse,
  Package,
  Radio,
  Download,
  AlertCircle,
  Clock,
  QrCode,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Check,
  Loader2,
} from 'lucide-react';
import { ThemeMode, Language, SubscriptionPlanItem, CurrentSubscriptionData, BillingInvoice } from '../../../types';
import { billingService } from '../../../services/billing.service';

interface BillingTabProps {
  theme: ThemeMode;
  lang: Language;
  t: any;
}

export const BillingTab: React.FC<BillingTabProps> = ({ theme, lang, t }) => {
  const isDark = theme === 'dark';

  const [plans, setPlans] = useState<SubscriptionPlanItem[]>([]);
  const [subscription, setSubscription] = useState<CurrentSubscriptionData | null>(null);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [subscribingCode, setSubscribingCode] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'promptpay'>('promptpay');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setIsLoading(true);
    try {
      const [plansRes, subRes, invRes] = await Promise.all([
        billingService.getPlans(),
        billingService.getCurrentSubscription(),
        billingService.getInvoices(),
      ]);
      setPlans(plansRes);
      setSubscription(subRes);
      setInvoices(invRes);
    } catch (e) {
      console.error('Failed to load billing data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSubscribe = async (planCode: string) => {
    if (subscription?.planCode === planCode) return;
    setSubscribingCode(planCode);
    try {
      await billingService.subscribe({
        planCode,
        paymentMethod: selectedPaymentMethod,
      });
      showToast(
        lang === 'th'
          ? `อัปเกรดเป็นแพ็กเกจ ${planCode} สำเร็จแล้ว!`
          : `Successfully upgraded to ${planCode} plan!`
      );
      // Refresh
      await loadBillingData();
    } catch {
      showToast(
        lang === 'th'
          ? 'เกิดข้อผิดพลาดในการทำรายการ กรุณาลองใหม่อีกครั้ง'
          : 'Failed to complete subscription. Please try again.'
      );
    } finally {
      setSubscribingCode(null);
    }
  };

  const calculateQuotaPercent = (used: number, max: number) => {
    if (max === 0 || max >= 9999) return 5;
    return Math.min(100, Math.round((used / max) * 100));
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-sm font-medium">
          {lang === 'th' ? 'กำลังโหลดข้อมูลแพ็กเกจและบิล...' : 'Loading billing information...'}
        </span>
      </div>
    );
  }

  const currentPlanCode = subscription?.planCode || 'FREE';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[10000] p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 text-sm font-semibold animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Current Subscription & Resource Quotas Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-sm relative overflow-hidden ${
          isDark
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-linear-to-br from-white to-blue-50/40 border-slate-200'
        }`}
      >
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                {lang === 'th' ? 'แพ็กเกจที่กำลังใช้งาน' : 'CURRENT PLAN'}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {subscription?.status?.toUpperCase() || 'ACTIVE'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 flex items-center gap-3">
              <span>{subscription?.planName || 'MatchStock Pro'}</span>
              <span className="text-lg text-amber-500">
                {currentPlanCode === 'ULTRA_MONTHLY' ? '🥇' : currentPlanCode === 'PRO_MONTHLY' ? '🥈' : '🥉'}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>
                {lang === 'th' ? 'รอบการคิดเงิน: ' : 'Billing Cycle: '}
                <strong className="capitalize text-slate-700 dark:text-slate-200">
                  {subscription?.billingCycle || 'monthly'}
                </strong>
                {subscription?.currentPeriodEnd &&
                  ` | ${lang === 'th' ? 'รอบถัดไป: ' : 'Next Renewal: '} ${new Date(
                    subscription.currentPeriodEnd
                  ).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US')}`}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const plansSection = document.getElementById('pricing-tiers');
                plansSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/25 flex items-center gap-2 transition cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              <span>{lang === 'th' ? 'เปลี่ยน / อัปเกรดแพ็กเกจ' : 'Change Plan'}</span>
            </button>
          </div>
        </div>

        {/* Quota Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 relative z-10 pt-6 border-t border-slate-200/80 dark:border-slate-800">
          {/* Users Quota */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-white border-slate-200/80'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-500" />
                {lang === 'th' ? 'ผู้ใช้งานระบบ' : 'Users'}
              </span>
              <span className="text-slate-900 dark:text-white font-bold">
                {subscription?.quotas.users.used || 0} /{' '}
                {subscription?.quotas.users.max && subscription.quotas.users.max >= 9999
                  ? '∞'
                  : subscription?.quotas.users.max || 10}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{
                  width: `${calculateQuotaPercent(
                    subscription?.quotas.users.used || 0,
                    subscription?.quotas.users.max || 10
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Warehouses Quota */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-white border-slate-200/80'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Warehouse className="w-4 h-4 text-emerald-500" />
                {lang === 'th' ? 'คลังสินค้า' : 'Warehouses'}
              </span>
              <span className="text-slate-900 dark:text-white font-bold">
                {subscription?.quotas.warehouses.used || 0} /{' '}
                {subscription?.quotas.warehouses.max && subscription.quotas.warehouses.max >= 9999
                  ? '∞'
                  : subscription?.quotas.warehouses.max || 3}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width: `${calculateQuotaPercent(
                    subscription?.quotas.warehouses.used || 0,
                    subscription?.quotas.warehouses.max || 3
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Products Quota */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-white border-slate-200/80'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Package className="w-4 h-4 text-purple-500" />
                {lang === 'th' ? 'สินค้า (SKUs)' : 'Products'}
              </span>
              <span className="text-slate-900 dark:text-white font-bold">
                {subscription?.quotas.products.used || 0} /{' '}
                {subscription?.quotas.products.max && subscription.quotas.products.max >= 9999
                  ? '∞'
                  : subscription?.quotas.products.max || 10000}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                style={{
                  width: `${calculateQuotaPercent(
                    subscription?.quotas.products.used || 0,
                    subscription?.quotas.products.max || 10000
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* RFID / Devices Quota */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-white border-slate-200/80'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-amber-500" />
                {lang === 'th' ? 'อุปกรณ์ RFID Gate' : 'RFID Devices'}
              </span>
              <span className="text-slate-900 dark:text-white font-bold">
                {subscription?.quotas.devices.used || 0} /{' '}
                {subscription?.quotas.devices.max || (currentPlanCode === 'ULTRA_MONTHLY' ? 10 : 0)}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{
                  width: `${calculateQuotaPercent(
                    subscription?.quotas.devices.used || 0,
                    subscription?.quotas.devices.max || 1
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Pricing Tiers Cards */}
      <div id="pricing-tiers" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {lang === 'th' ? 'เลือกแผนแพ็กเกจที่เหมาะกับธุรกิจคุณ' : 'Choose Your Subscription Plan'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'th'
                ? 'อัปเกรดหรือปรับเปลี่ยนแพ็กเกจได้ตลอดเวลา ฟีเจอร์จะมีผลทันที'
                : 'Upgrade or switch plans anytime. Features activate instantly.'}
            </p>
          </div>

          {/* Payment Method Selector Mock */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setSelectedPaymentMethod('promptpay')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedPaymentMethod === 'promptpay'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>PromptPay</span>
            </button>
            <button
              onClick={() => setSelectedPaymentMethod('card')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedPaymentMethod === 'card'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Credit Card</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {plans.map((plan) => {
            const isCurrent = currentPlanCode === plan.code;
            const isSubmittingThis = subscribingCode === plan.code;
            const priceBaht = Math.round(plan.priceMinor / 100);

            return (
              <div
                key={plan.id}
                className={`rounded-3xl border flex flex-col justify-between p-6 sm:p-7 relative transition hover:shadow-lg ${
                  isCurrent
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/10'
                    : isDark
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-slate-200'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[11px] uppercase tracking-wider shadow-md shadow-blue-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>{lang === 'th' ? 'แพ็กเกจปัจจุบัน' : 'Current Plan'}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                      {plan.code}
                    </span>
                    <span className="text-xl">
                      {plan.code === 'ULTRA_MONTHLY' ? '🥇' : plan.code === 'PRO_MONTHLY' ? '🥈' : '🥉'}
                    </span>
                  </div>

                  <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {plan.name}
                  </h4>

                  {/* Price */}
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                      {priceBaht === 0 ? 'ฟรี' : `฿${priceBaht.toLocaleString()}`}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      /{lang === 'th' ? 'เดือน' : 'mo'}
                    </span>
                  </div>

                  {/* Quotas Summary */}
                  <div className="mt-5 space-y-2 text-xs font-medium text-slate-600 dark:text-slate-300 pb-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{lang === 'th' ? 'ผู้ใช้งาน:' : 'Users:'}</span>
                      <strong className="text-slate-900 dark:text-white">
                        {plan.maxUsers >= 9999 ? (lang === 'th' ? 'ไม่จำกัด' : 'Unlimited') : `${plan.maxUsers} บัญชี`}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{lang === 'th' ? 'คลังสินค้า:' : 'Warehouses:'}</span>
                      <strong className="text-slate-900 dark:text-white">
                        {plan.maxWarehouses >= 9999 ? (lang === 'th' ? 'ไม่จำกัด' : 'Unlimited') : `${plan.maxWarehouses} แห่ง`}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{lang === 'th' ? 'จำนวนสินค้า:' : 'Products:'}</span>
                      <strong className="text-slate-900 dark:text-white">
                        {plan.maxProducts >= 9999 ? (lang === 'th' ? 'ไม่จำกัด' : 'Unlimited') : `${plan.maxProducts.toLocaleString()} SKUs`}
                      </strong>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="mt-5 space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      {lang === 'th' ? 'ฟีเจอร์ที่รวมในแพ็กเกจ' : 'INCLUDED FEATURES'}
                    </span>
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="capitalize">
                          {feat === '*'
                            ? lang === 'th' ? 'ปลดล็อคทุกฟีเจอร์ + RFID Hardware Bridge' : 'All Features + RFID Hardware Automation'
                            : feat.replace('.', ' / ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-8 pt-4">
                  <button
                    disabled={isCurrent || isSubmittingThis}
                    onClick={() => handleSubscribe(plan.code)}
                    className={`w-full py-3 px-4 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                      isCurrent
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 active:scale-98'
                    }`}
                  >
                    {isSubmittingThis ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{lang === 'th' ? 'กำลังดำเนินการ...' : 'Processing...'}</span>
                      </>
                    ) : isCurrent ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{lang === 'th' ? 'ใช้งานอยู่นี้' : 'Current Active Plan'}</span>
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="w-4 h-4" />
                        <span>
                          {lang === 'th' ? `สมัครใช้งาน ${plan.name}` : `Upgrade to ${plan.name}`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Invoices History Table */}
      <div
        className={`p-6 sm:p-7 rounded-3xl border shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {lang === 'th' ? 'ประวัติใบแจ้งหนี้และใบเสร็จรับเงิน' : 'Invoices & Payment Receipts'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'th'
                ? 'ดาวน์โหลดเอกสารใบเสร็จเพื่อนำไปใช้ในงานบัญชีและภาษีของบริษัท'
                : 'Download receipts and invoices for tax & company accounting.'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">{lang === 'th' ? 'เลขที่ใบแจ้งหนี้' : 'Invoice Number'}</th>
                <th className="py-3 px-4">{lang === 'th' ? 'วันที่ชำระ' : 'Date Paid'}</th>
                <th className="py-3 px-4">{lang === 'th' ? 'ยอดเงิน' : 'Amount'}</th>
                <th className="py-3 px-4">{lang === 'th' ? 'สถานะ' : 'Status'}</th>
                <th className="py-3 px-4 text-right">{lang === 'th' ? 'ดาวน์โหลด' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-xs sm:text-sm">
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(inv.paidAt || inv.issuedAt).toLocaleDateString(
                        lang === 'th' ? 'th-TH' : 'en-US'
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      ฿{(inv.totalMinor / 100).toLocaleString()} {inv.currency}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 uppercase">
                        <CheckCircle2 className="w-3 h-3" />
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => showToast(lang === 'th' ? `ดาวน์โหลดใบเสร็จ ${inv.invoiceNumber} เรียบร้อยแล้ว` : `Downloaded ${inv.invoiceNumber}`)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition inline-flex items-center gap-1 cursor-pointer text-xs font-semibold"
                      >
                        <Download className="w-4 h-4" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    {lang === 'th' ? 'ยังไม่มีประวัติใบแจ้งหนี้' : 'No invoices found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Package, Warehouse, BarChart3, QrCode, ShieldCheck, ArrowRightLeft, Bell } from 'lucide-react';

export function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold flex items-center gap-2">
            <Package className="w-5 h-5" />
            <span>MatchStock</span>
          </div>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30">
            Multi-Tenant WMS
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <Bell className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">
              AD
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium leading-none">Admin User</p>
              <p className="text-xs text-slate-400 mt-1">Tenant: WH-Bangkok</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-900/40 rounded-2xl p-8 shadow-xl">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            ระบบบริหารจัดการคลังสินค้าอัจฉริยะ (WMS)
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl text-sm md:text-base">
            ยินดีต้อนรับสู่ MatchStock แพลตฟอร์มบริหารคลังสินค้า Multi-tenant พร้อมระบบตัดสต็อก FIFO, ตรวจนับ Cycle Count และสแกนบาร์โค้ด
          </p>
        </section>

        {/* Core Modules Grid */}
        <section>
          <h2 className="text-lg font-semibold text-slate-200 mb-4">โมดูลหลักของระบบ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Warehouse className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">Master Data & Products</h3>
              <p className="text-xs text-slate-400 mt-1">จัดการ SKU, คลังสินค้า, ตำแหน่ง Bin, ซัพพลายเออร์ และมิติสินค้า</p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">Stock Transactions</h3>
              <p className="text-xs text-slate-400 mt-1">บันทึกรับ (GR), จ่าย (GI ตัด FIFO), โอนย้ายข้ามคลัง/Bin และปรับยอดสต็อก</p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">Cycle Count & Scanner</h3>
              <p className="text-xs text-slate-400 mt-1">สแกนบาร์โค้ดผ่านกล้องมือถือ ตรวจนับสต็อกตามรอบ และคำนวณผลต่าง Variance</p>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">Analytics & Reports</h3>
              <p className="text-xs text-slate-400 mt-1">รายงาน Stock Card การเคลื่อนไหวสินค้า, วิเคราะห์ Fast/Slow Moving และมูลค่าสต็อก</p>
            </div>

            {/* Card 5 */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">Smart Inventory Alerts</h3>
              <p className="text-xs text-slate-400 mt-1">แจ้งเตือนสินค้าถึงจุด Reorder Point, สินค้าใกล้หมดอายุ และสินค้าเกินความจุ</p>
            </div>

            {/* Card 6 */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">Multi-Tenancy & Security</h3>
              <p className="text-xs text-slate-400 mt-1">แยกข้อมูล Tenant เด็ดขาด พร้อมกำหนดสิทธิ์ RBAC 4 ระดับบทบาท</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        MatchStock WMS System &copy; 2026. Built with React (Firebase Hosting) & Node.js Prisma (Cloud Run).
      </footer>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Home,
  Users,
  GraduationCap,
  CalendarDays,
  CircleDollarSign,
  Download,
  Bell,
  Search,
  Menu,
  X,
  User,
  Star,
  Plus,
  FileDown,
  Phone,
  Link as LinkIcon,
  Printer,
  BookOpen,
  Calendar,
  DollarSign,
  Wallet,
  TrendingUp,
  TrendingDown,
  FileText
} from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("الرئيسية");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isPrivateModalOpen, setIsPrivateModalOpen] = useState(false);
  const [activeGroupFilter, setActiveGroupFilter] = useState("الكل");
  const [scheduleView, setScheduleView] = useState<"احترافي" | "تقليدي">("احترافي");

  const navigation = [
    { name: "الرئيسية", icon: Home },
    { name: "المجموعات", icon: Users },
    { name: "الطلاب", icon: BookOpen },
    { name: "الجدول", icon: Calendar },
    { name: "المالية", icon: DollarSign },
  ];

  return (
    <div className="flex h-screen bg-[#0B1120] text-white font-sans selection:bg-indigo-500/30">
      
      {/* Sidebar (Right Fixed) */}
      <aside 
        className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l border-white/10 bg-[#111827] transition-transform duration-300 lg:static lg:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex h-20 items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              منصة الصفوة
            </h1>
          </div>
          <button className="lg:hidden rounded-lg p-2 hover:bg-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  setIsMobileMenuOpen(false);
                }}
                className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-white text-[#111827] shadow-lg shadow-white/10"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon 
                  className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-[#111827]" : "text-gray-400 group-hover:text-white"
                  }`} 
                />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-6">
          <div className="rounded-xl bg-gradient-to-br from-[#0B1120] to-[#111827] border border-white/5 p-4 text-center shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
            <p className="text-sm font-medium text-gray-300 relative z-10">إدارة يومك الدراسي بسهولة</p>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        
        {/* Header */}
        <header className="flex h-20 items-center justify-between border-b border-white/10 bg-[#111827]/80 px-4 sm:px-6 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden rounded-lg p-2 bg-white/5 text-gray-300 hover:bg-white/10 transition-colors" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:flex flex-col">
              <span className="text-xs text-gray-400">تاريخ اليوم</span>
              <span className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-indigo-400" />
                اليوم: الأربعاء، 12 أغسطس 2026
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button className="hidden sm:flex items-center gap-2 rounded-xl bg-indigo-500/10 px-4 py-2.5 text-sm font-semibold text-indigo-300 transition-all hover:bg-indigo-500/20 hover:text-indigo-200 border border-indigo-500/20 active:scale-95">
              <Download className="h-4 w-4" />
              تثبيت التطبيق (PWA)
            </button>
            
            <button className="relative rounded-xl p-2.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white bg-[#0B1120] border border-white/5">
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#0B1120] animate-pulse"></span>
              <Bell className="h-5 w-5" />
            </button>

            <div className="hidden sm:block h-8 w-px bg-white/10"></div>

            <button className="flex items-center gap-3 transition-opacity hover:opacity-80 rounded-xl hover:bg-white/5 p-1.5 pr-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-white">أستاذ محمد كمال زكي</p>
                <p className="text-xs text-gray-400">معلم رياضيات</p>
              </div>
              <div className="flex h-10 w-10 overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 items-center justify-center text-indigo-300">
                <User className="h-5 w-5" />
              </div>
            </button>
          </div>
        </header>

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="mx-auto max-w-7xl space-y-8">


            {activeTab === "الرئيسية" ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Welcome Section */}
                <div className="rounded-2xl border border-gray-800 bg-[#111827] p-8 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                  <h2 className="text-3xl font-bold text-white relative z-10">أهلاً بك — أكمل بياناتك</h2>
                  <p className="mt-2 text-gray-400 relative z-10">المادة: <span className="text-gray-500">لم تُحدد بعد</span></p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1 */}
                  <div className="relative rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-sm transition-all hover:border-gray-700 hover:shadow-lg hover:shadow-green-500/5 text-center flex flex-col justify-center">
                    <div className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    <p className="text-sm font-medium text-gray-400 mt-2">الطلاب المتوقعين</p>
                    <p className="mt-4 text-4xl font-bold text-white">0</p>
                  </div>
                  
                  {/* Card 2 */}
                  <div className="relative rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-sm transition-all hover:border-gray-700 hover:shadow-lg hover:shadow-blue-500/5 text-center flex flex-col justify-center">
                    <div className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                    <p className="text-sm font-medium text-gray-400 mt-2">حصص اليوم</p>
                    <p className="mt-4 text-4xl font-bold text-white">0</p>
                  </div>

                  {/* Card 3 */}
                  <div className="relative rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-sm transition-all hover:border-gray-700 hover:shadow-lg hover:shadow-orange-500/5 text-center flex flex-col justify-center">
                    <div className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
                    <p className="text-sm font-medium text-gray-400 mt-2">المجموعات</p>
                    <p className="mt-4 text-4xl font-bold text-white">0</p>
                  </div>
                </div>

                {/* Schedule Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">حصص اليوم المجدولة (الأربعاء):</h3>
                  
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-800 bg-[#111827]/50 py-16 text-center transition-all hover:bg-[#111827]">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)] relative">
                      <Star className="h-8 w-8 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)] relative z-10" />
                      <div className="absolute inset-0 bg-indigo-400/20 rounded-full blur-md animate-pulse"></div>
                    </div>
                    <h4 className="text-lg font-medium text-white">لا توجد حصص مجدولة لليوم</h4>
                    <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                      يمكنك إضافة أو تعديل مواعيد المجموعات من قسم المجموعات.
                    </p>
                  </div>
                </div>
              </div>
            ) : activeTab === "المجموعات" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => setIsGroupModalOpen(true)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 flex-1 sm:flex-none"
                    >
                      <Plus className="h-4 w-4" />
                      إضافة مجموعة
                    </button>
                    <button 
                      onClick={() => setIsPrivateModalOpen(true)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#111827] border border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-300 transition-all hover:bg-white/5 active:scale-95 flex-1 sm:flex-none"
                    >
                      <Plus className="h-4 w-4" />
                      إضافة طالب برايفت
                    </button>
                  </div>
                  <button className="flex items-center justify-center gap-2 rounded-xl bg-[#111827] border border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-300 transition-all hover:bg-white/5 w-full sm:w-auto">
                    <FileDown className="h-4 w-4" />
                    تحميل تقرير شهري
                  </button>
                </div>

                {/* Search & Filters */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="ابحث عن اسم المجموعة..." 
                      className="w-full rounded-xl border border-gray-800 bg-[#111827] py-3 pr-12 pl-4 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {['الكل', 'أونلاين', 'السنتر', 'م.ج برايفت', 'طالب برايفت'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveGroupFilter(filter)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                          activeGroupFilter === filter
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            : "bg-[#111827] text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-gray-300"
                        }`}
                      >
                        {filter} <span className="ml-1 text-xs opacity-60">(0)</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Empty State */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-800 bg-[#111827]/40 py-24 text-center mt-8 transition-colors hover:bg-[#111827]/60">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/5">
                    <Users className="h-8 w-8 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">لا توجد مجموعات حالياً</h3>
                  <p className="mt-2 text-sm text-gray-400">أضف أول مجموعة الآن لتبدأ في إدارة طلابك وحصصك.</p>
                  <button 
                    onClick={() => setIsGroupModalOpen(true)}
                    className="mt-6 flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/20 active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                    إضافة مجموعة جديدة
                  </button>
                </div>
              </div>
            ) : activeTab === "الجدول" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-sm">
                  <div>
                    <h3 className="text-xl font-bold text-white">الجدول الأسبوعي الكامل</h3>
                    <p className="mt-1 text-sm text-gray-400">عرض جميع المجموعات والمواعيد بشكل احترافي قابل للطباعة</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center rounded-xl bg-[#0B1120] border border-gray-800 p-1">
                      <button 
                        onClick={() => setScheduleView("احترافي")}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                          scheduleView === "احترافي" 
                            ? "bg-indigo-600 text-white shadow-md" 
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        احترافي
                      </button>
                      <button 
                        onClick={() => setScheduleView("تقليدي")}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                          scheduleView === "تقليدي" 
                            ? "bg-indigo-600 text-white shadow-md" 
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        تقليدي
                      </button>
                    </div>
                    <button className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/20 active:scale-95 w-full sm:w-auto">
                      <Printer className="h-4 w-4" />
                      طباعة الجدول
                    </button>
                  </div>
                </div>

                {/* The Grid View */}
                {scheduleView === "احترافي" && (
                  <div className="rounded-2xl border border-gray-800 bg-[#111827] shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      <table className="w-full border-collapse text-right text-sm">
                        <thead>
                          <tr className="border-b border-gray-800 bg-[#0B1120]/50">
                            <th className="min-w-[120px] border-l border-gray-800 p-4 font-bold text-white sticky right-0 bg-[#0B1120] z-20 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.5)]">
                              اليوم / الساعة
                            </th>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i === 0 ? '12 ص' : i < 12 ? `${i} ص` : i === 12 ? '12 م' : `${i - 12} م`;
                              return (
                                <th key={i} className="min-w-[80px] border-l border-gray-800 p-4 font-semibold text-gray-400 whitespace-nowrap text-center">
                                  {hour}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((day) => (
                            <tr key={day} className="border-b border-gray-800 hover:bg-white/5 transition-colors group">
                              <td className="border-l border-gray-800 p-4 font-bold text-white sticky right-0 bg-[#111827] group-hover:bg-[#1a2333] z-10 transition-colors shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.5)]">
                                {day}
                              </td>
                              {Array.from({ length: 24 }, (_, i) => (
                                <td key={i} className="border-l border-gray-800/50 p-4 text-center text-gray-700/50 font-mono transition-colors hover:bg-white/5 cursor-crosshair">
                                  --
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Traditional View Placeholder */}
                {scheduleView === "تقليدي" && (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-800 bg-[#111827]/40 py-32 text-center transition-colors hover:bg-[#111827]/60">
                    <CalendarDays className="h-12 w-12 text-gray-600 mb-4 animate-pulse" />
                    <h3 className="text-xl font-bold text-white">العرض التقليدي</h3>
                    <p className="mt-2 text-sm text-gray-400">سيتم عرض قائمة المواعيد مرتبة زمنياً هنا.</p>
                  </div>
                )}
              </div>
            ) : activeTab === "المالية" ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-sm">
                  <div>
                    <h3 className="text-xl font-bold text-white">السجل المالي</h3>
                    <p className="mt-1 text-sm text-gray-400">كل مجموعات السنتر</p>
                  </div>
                  <button className="flex items-center justify-center gap-2 rounded-xl bg-[#111827] border border-gray-700 px-5 py-2.5 text-sm font-semibold text-gray-300 transition-all hover:bg-white/5 active:scale-95 w-full sm:w-auto shadow-sm">
                    <FileDown className="h-4 w-4" />
                    تصدير السجل المالي PDF
                  </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1 */}
                  <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-sm transition-all hover:border-gray-700 hover:shadow-lg hover:shadow-green-500/5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-400">المحصل</p>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20">
                        <Wallet className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-white">0 <span className="text-sm font-medium text-gray-600">ج.م</span></p>
                  </div>
                  
                  {/* Card 2 */}
                  <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-sm transition-all hover:border-gray-700 hover:shadow-lg hover:shadow-blue-500/5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-400">إجمالي المتوقع</p>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-white">0 <span className="text-sm font-medium text-gray-600">ج.م</span></p>
                  </div>

                  {/* Card 3 */}
                  <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-sm transition-all hover:border-gray-700 hover:shadow-lg hover:shadow-orange-500/5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-400">المتبقي</p>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <TrendingDown className="h-5 w-5 text-orange-500" />
                      </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-white">0 <span className="text-sm font-medium text-gray-600">ج.م</span></p>
                  </div>

                  {/* Card 4 */}
                  <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-sm transition-all hover:border-gray-700 hover:shadow-lg hover:shadow-red-500/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">طالب</p>
                        <p className="text-xs text-red-400/80 mt-1 font-medium">عليهم مستحقات</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                        <Users className="h-5 w-5 text-red-500" />
                      </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-white">0</p>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex justify-end gap-3 border-b border-gray-800 pb-8">
                  <div className="w-full sm:w-48">
                    <select className="w-full rounded-xl border border-gray-800 bg-[#111827] px-4 py-2.5 text-sm text-gray-300 focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer hover:border-gray-700 transition-colors shadow-sm font-medium">
                      <option value="">اختار المجموعة</option>
                      <option value="1">مجموعة السبت 4 عصراً</option>
                      <option value="2">مجموعة الأحد 6 مساءً</option>
                    </select>
                  </div>
                  <div className="w-full sm:w-48">
                    <select className="w-full rounded-xl border border-gray-800 bg-[#111827] px-4 py-2.5 text-sm text-gray-300 focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer hover:border-gray-700 transition-colors shadow-sm font-medium">
                      <option value="">تصفية حسب</option>
                      <option value="today">اليوم</option>
                      <option value="week">هذا الأسبوع</option>
                      <option value="month">هذا الشهر</option>
                    </select>
                  </div>
                </div>

                {/* Table / Tabs Section */}
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <FileText className="h-5 w-5 text-indigo-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white">السجل المالي</h3>
                    </div>

                    {/* Segmented Control */}
                    <div className="flex items-center rounded-xl bg-[#111827] border border-gray-800 p-1 w-full sm:w-auto">
                      <button className="flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-lg bg-white text-[#111827] shadow-md transition-all">
                        الكل
                      </button>
                      <button className="flex-1 sm:flex-none px-6 py-2 text-sm font-semibold rounded-lg text-gray-400 hover:text-white transition-all">
                        مدفوع
                      </button>
                      <button className="flex-1 sm:flex-none px-6 py-2 text-sm font-semibold rounded-lg text-gray-400 hover:text-white transition-all">
                        متبقي
                      </button>
                    </div>
                  </div>

                  {/* Empty State */}
                  <div className="py-24 text-center">
                    <p className="text-gray-600 font-bold text-lg tracking-wide">لا توجد سجلات دفع مطابقة</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Content Placeholder for other tabs */
              <div className="group relative flex h-[500px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#111827]/40 transition-all hover:bg-[#111827]/60 hover:border-white/20 mt-8">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B1120]/50 rounded-2xl pointer-events-none"></div>
                <div className="text-center relative z-10 transform transition-transform group-hover:-translate-y-2">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 shadow-inner border border-white/5">
                    <Search className="h-10 w-10 text-gray-500 transition-colors group-hover:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">محتوى الصفحة هنا</h3>
                  <p className="mt-2 text-sm text-gray-400">جاري تحميل البيانات الخاصة بـ <span className="font-semibold text-indigo-400">{activeTab}</span>...</p>
                  
                  <div className="mt-8 flex justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

      </div>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[#0B1120]/80 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Group Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-gray-700 bg-[#111827] shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white">إضافة مجموعة جديدة</h2>
              <button onClick={() => setIsGroupModalOpen(false)} className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">اسم المجموعة</label>
                <input type="text" className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none" placeholder="مثال: مجموعة السبت 4 عصراً" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">المادة</label>
                  <input type="text" className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none opacity-60" placeholder="الرياضيات" disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">نوع المجموعة</label>
                  <select className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none appearance-none">
                    <option>سنتر</option>
                    <option>أونلاين</option>
                    <option>م.ج برايفت</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">سعر الحصة / الشهر</label>
                  <input type="number" className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">طريقة الدفع</label>
                  <select className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none appearance-none">
                    <option>بالحصة</option>
                    <option>بالشهر</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">رابط جروب الواتساب (اختياري)</label>
                <div className="relative">
                  <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input type="url" className="w-full rounded-xl border border-gray-700 bg-[#0B1120] py-2.5 pr-10 pl-4 text-white focus:border-indigo-500 focus:outline-none text-left dir-ltr" placeholder="https://chat.whatsapp.com/..." />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">مواعيد المجموعة</label>
                <div className="flex gap-2 items-center">
                  <select className="flex-1 rounded-xl border border-gray-700 bg-[#0B1120] px-4 py-2 text-white focus:border-indigo-500 focus:outline-none appearance-none">
                    <option>السبت</option>
                    <option>الأحد</option>
                    <option>الإثنين</option>
                    <option>الثلاثاء</option>
                    <option>الأربعاء</option>
                    <option>الخميس</option>
                    <option>الجمعة</option>
                  </select>
                  <input type="time" className="flex-1 rounded-xl border border-gray-700 bg-[#0B1120] px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
                  <button className="rounded-xl border border-gray-700 bg-white/5 p-2.5 text-gray-400 hover:text-white transition-colors">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 p-6 flex gap-3">
              <button className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95">
                حفظ وإنشاء
              </button>
              <button onClick={() => setIsGroupModalOpen(false)} className="rounded-xl border border-gray-700 bg-[#0B1120] px-6 py-3 text-sm font-bold text-gray-300 transition-colors hover:bg-white/5 active:scale-95">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Private Student Modal */}
      {isPrivateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-gray-700 bg-[#111827] shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white">إضافة طالب برايفت</h2>
              <button onClick={() => setIsPrivateModalOpen(false)} className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">اسم الطالب</label>
                <input type="text" className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none" placeholder="الاسم ثلاثي" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">رقم هاتف الطالب</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input type="tel" className="w-full rounded-xl border border-gray-700 bg-[#0B1120] py-2.5 pr-9 pl-4 text-white focus:border-indigo-500 focus:outline-none text-left dir-ltr" placeholder="01..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">رقم ولي الأمر</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input type="tel" className="w-full rounded-xl border border-gray-700 bg-[#0B1120] py-2.5 pr-9 pl-4 text-white focus:border-indigo-500 focus:outline-none text-left dir-ltr" placeholder="01..." />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">المادة</label>
                  <input type="text" className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none opacity-60" placeholder="الرياضيات" disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">سعر الحصة / الشهر</label>
                  <input type="number" className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none" placeholder="0" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">مواعيد الحصص</label>
                <div className="flex gap-2 items-center">
                  <select className="flex-1 rounded-xl border border-gray-700 bg-[#0B1120] px-4 py-2 text-white focus:border-indigo-500 focus:outline-none appearance-none">
                    <option>السبت</option>
                    <option>الأحد</option>
                    <option>الإثنين</option>
                  </select>
                  <input type="time" className="flex-1 rounded-xl border border-gray-700 bg-[#0B1120] px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
                  <button className="rounded-xl border border-gray-700 bg-white/5 p-2.5 text-gray-400 hover:text-white transition-colors">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 p-6 flex gap-3">
              <button className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95">
                حفظ بيانات الطالب
              </button>
              <button onClick={() => setIsPrivateModalOpen(false)} className="rounded-xl border border-gray-700 bg-[#0B1120] px-6 py-3 text-sm font-bold text-gray-300 transition-colors hover:bg-white/5 active:scale-95">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Users,
  Crown,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Calendar,
  Copy,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AdminPanel() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'teachers' | 'codes'>('dashboard');

  // Auth state
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Teachers data
  const [teachers, setTeachers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'suspended'>('all');
  const [filterPlan, setFilterPlan] = useState<'all' | 'trial' | 'monthly' | 'annual'>('all');

  // Codes data
  const [codes, setCodes] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [codeForm, setCodeForm] = useState({
    type: 'trial',
    duration_days: 7,
    quantity: 1
  });

  // Stats
  const [stats, setStats] = useState({
    totalTeachers: 0,
    activeSubscriptions: 0,
    revenue: 0,
    newThisMonth: 0
  });

  // Check auth and role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.warn('[ADMIN AUTH START] Starting admin auth check...');

        // Use getUser() instead of getSession() — getUser() makes an API call
        // to validate the JWT and is reliable even on first load after navigation.
        // getSession() reads from localStorage and can return null before
        // the Supabase client has finished rehydrating, causing a false redirect.
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.warn('[ADMIN AUTH RESULT] user:', user?.id, 'error:', userError?.message);

        if (!user) {
          console.warn('[ADMIN REDIRECT] No authenticated user, redirecting to /');
          router.push('/');
          return;
        }

        console.warn('[ADMIN PROFILE RESULT] Fetching profile for user:', user.id);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        console.warn('[ADMIN PROFILE RESULT] profile:', profile, 'error:', profileError?.message);
        console.warn('[ADMIN ROLE] role value:', profile?.role);

        if (profileError || !profile || profile.role !== 'super_admin') {
          console.warn('[ADMIN REDIRECT] Access denied. role:', profile?.role, 'error:', profileError?.message);
          toast.error('غير مصرح لك بالوصول إلى هذه الصفحة');
          router.push('/');
          return;
        }

        console.warn('[ADMIN READY] Access granted! Role:', profile.role, 'User:', user.id);
        setUserRole(profile.role);
        setUserId(user.id);
        setIsLoading(false);
      } catch (err) {
        console.error('[ADMIN AUTH START] EXCEPTION:', err);
        toast.error('حدث خطأ في التحقق من الصلاحيات');
        router.push('/');
      }
    };

    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch teachers
  useEffect(() => {
    if (!userRole) return;
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  // Fetch codes
  useEffect(() => {
    if (!userRole) return;
    fetchCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  const fetchTeachers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'teacher')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching teachers:', error);
      return;
    }

    setTeachers(data || []);

    // Calculate stats
    const now = new Date();
    const activeCount = data?.filter(t => {
      if (!t.subscription_expires_at) return false;
      return new Date(t.subscription_expires_at) > now;
    }).length || 0;

    const thisMonth = data?.filter(t => {
      const created = new Date(t.created_at);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length || 0;

    setStats({
      totalTeachers: data?.length || 0,
      activeSubscriptions: activeCount,
      revenue: 0, // TODO: Calculate from payments
      newThisMonth: thisMonth
    });
  };

  const fetchCodes = async () => {
    const { data, error } = await supabase
      .from('subscription_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching codes:', error);
      return;
    }

    setCodes(data || []);
  };

  const generateCodes = async () => {
    setIsGenerating(true);
    const newCodes = [];

    for (let i = 0; i < codeForm.quantity; i++) {
      const code = `${codeForm.type.toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      const { error } = await supabase.from('subscription_codes').insert({
        code,
        type: codeForm.type,
        duration_days: codeForm.duration_days,
        status: 'unused'
      });

      if (!error) {
        newCodes.push(code);
      }
    }

    setIsGenerating(false);
    if (newCodes.length > 0) {
      toast.success(`تم إنشاء ${newCodes.length} كود بنجاح`);
      fetchCodes();
    }
  };

  const suspendTeacher = async (teacherId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'suspended' })
      .eq('id', teacherId);

    if (error) {
      toast.error('حدث خطأ');
      return;
    }

    toast.success('تم تعليق الحساب');
    fetchTeachers();
  };

  const deleteTeacher = async (teacherId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحساب؟')) return;

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', teacherId);

    if (error) {
      toast.error('حدث خطأ');
      return;
    }

    toast.success('تم الحذف');
    fetchTeachers();
  };

  const exportCodes = () => {
    const csv = [
      ['Code', 'Type', 'Duration Days', 'Status', 'Used By', 'Created At'].join(','),
      ...codes.map(c => [c.code, c.type, c.duration_days, c.status, c.used_by || '', c.created_at].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teacher.phone?.includes(searchQuery);

    let matchesStatus = true;
    if (filterStatus !== 'all') {
      const now = new Date();
      const expiresAt = teacher.subscription_expires_at ? new Date(teacher.subscription_expires_at) : null;

      if (filterStatus === 'active') matchesStatus = !!(expiresAt && expiresAt > now);
      else if (filterStatus === 'expired') matchesStatus = !expiresAt || expiresAt <= now;
      else if (filterStatus === 'suspended') matchesStatus = teacher.status === 'suspended';
    }

    let matchesPlan = true;
    if (filterPlan !== 'all') {
      matchesPlan = teacher.subscription_plan === filterPlan;
    }

    return matchesSearch && matchesStatus && matchesPlan;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B1120]">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => router.push('/')}
                className="flex items-center justify-center h-10 w-10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/20">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold">لوحة التحكم</h1>
              </div>
            </div>
            <p className="text-gray-400 text-sm">إدارة المعلمين والاشتراكات والأكواد</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-800 overflow-x-auto scrollbar-hide">
          {[
            { id: 'dashboard', label: 'لوحة المعلومات', icon: TrendingUp },
            { id: 'teachers', label: 'المعلمين', icon: Users },
            { id: 'codes', label: 'أكواد الاشتراك', icon: Crown }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-gray-800 bg-[#111827] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">إجمالي المعلمين</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.totalTeachers}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10">
                    <Users className="h-6 w-6 text-indigo-400" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-800 bg-[#111827] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">اشتراكات نشطة</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.activeSubscriptions}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-800 bg-[#111827] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">تسجيلات جديدة</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.newThisMonth}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                    <TrendingUp className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-800 bg-[#111827] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">الإيرادات</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.revenue} ج.م</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
                    <DollarSign className="h-6 w-6 text-yellow-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Teachers Tab */}
        {activeTab === 'teachers' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو رقم الهاتف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-800 bg-[#111827] py-3 pr-11 pl-4 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="rounded-xl border border-gray-800 bg-[#111827] px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">كل الحالات</option>
                <option value="active">نشط</option>
                <option value="expired">منتهي</option>
                <option value="suspended">معلق</option>
              </select>
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value as any)}
                className="rounded-xl border border-gray-800 bg-[#111827] px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">كل الباقات</option>
                <option value="trial">تجريبي</option>
                <option value="monthly">شهري</option>
                <option value="annual">سنوي</option>
              </select>
            </div>

            {/* Teachers Table */}
            <div className="rounded-xl border border-gray-800 bg-[#111827] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0B1120] border-b border-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">المعلم</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">الهاتف</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">الباقة</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">الحالة</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">تنتهي في</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredTeachers.map(teacher => {
                      const expiresAt = teacher.subscription_expires_at ? new Date(teacher.subscription_expires_at) : null;
                      const isActive = expiresAt && expiresAt > new Date();

                      return (
                        <tr key={teacher.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 font-bold">
                                {teacher.name?.charAt(0) || 'M'}
                              </div>
                              <span className="text-sm font-medium text-white">{teacher.name || 'معلم'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">{teacher.phone || '-'}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-400 border border-purple-500/20">
                              {teacher.subscription_plan || 'trial'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              isActive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {isActive ? 'نشط' : 'منتهي'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {expiresAt ? expiresAt.toLocaleDateString('ar-EG') : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => suspendTeacher(teacher.id)}
                                className="p-2 rounded-lg text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                                title="تعليق"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteTeacher(teacher.id)}
                                className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                title="حذف"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Codes Tab */}
        {activeTab === 'codes' && (
          <div className="space-y-6">
            {/* Generate Form */}
            <div className="rounded-xl border border-gray-800 bg-[#111827] p-6">
              <h3 className="text-lg font-bold text-white mb-4">إنشاء أكواد جديدة</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">نوع الباقة</label>
                  <select
                    value={codeForm.type}
                    onChange={(e) => setCodeForm({...codeForm, type: e.target.value})}
                    className="w-full rounded-xl border border-gray-800 bg-[#0B1120] px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="trial">تجريبي (7 أيام)</option>
                    <option value="monthly">شهري (30 يوم)</option>
                    <option value="annual">سنوي (365 يوم)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">المدة (أيام)</label>
                  <input
                    type="number"
                    value={codeForm.duration_days}
                    onChange={(e) => setCodeForm({...codeForm, duration_days: parseInt(e.target.value)})}
                    className="w-full rounded-xl border border-gray-800 bg-[#0B1120] px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">الكمية</label>
                  <input
                    type="number"
                    value={codeForm.quantity}
                    onChange={(e) => setCodeForm({...codeForm, quantity: parseInt(e.target.value)})}
                    className="w-full rounded-xl border border-gray-800 bg-[#0B1120] px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={generateCodes}
                  disabled={isGenerating}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {isGenerating ? 'جاري الإنشاء...' : 'إنشاء الأكواد'}
                </button>
                <button
                  onClick={exportCodes}
                  className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  تصدير CSV
                </button>
              </div>
            </div>

            {/* Codes Table */}
            <div className="rounded-xl border border-gray-800 bg-[#111827] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0B1120] border-b border-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">الكود</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">النوع</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">المدة</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">الحالة</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">تاريخ الإنشاء</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {codes.map(code => (
                      <tr key={code.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                              {code.code}
                            </code>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(code.code);
                                toast.success('تم النسخ');
                              }}
                              className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-400 border border-purple-500/20">
                            {code.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">{code.duration_days} يوم</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            code.status === 'unused' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                          }`}>
                            {code.status === 'unused' ? 'غير مستخدم' : 'مستخدم'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {new Date(code.created_at).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(code.code);
                              toast.success('تم النسخ');
                            }}
                            className="p-2 rounded-lg text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                            title="نسخ"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

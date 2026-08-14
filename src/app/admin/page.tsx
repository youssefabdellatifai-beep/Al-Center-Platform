"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Users,
  ShieldCheck,
  Search,
  MoreVertical,
  Calendar,
  AlertTriangle,
  Ban,
  CheckCircle,
  Plus,
  Trash2,
  LogOut,
  Clock,
  X
} from "lucide-react";

type TeacherProfile = {
  id: string;
  full_name: string;
  subject: string;
  phone: string;
  subscription_expires_at: string | null;
  status: 'active' | 'suspended';
  subscription_plan: string | null;
  created_at: string;
};

type ActivationCode = {
  id: string;
  code: string;
  duration_months: number;
  is_used: boolean;
  plan_name?: string;
  created_at: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGenerateCodeModalOpen, setIsGenerateCodeModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherProfile | null>(null);
  
  const [activationCodes, setActivationCodes] = useState<ActivationCode[]>([]);
  const [generateCodeDuration, setGenerateCodeDuration] = useState<number>(1);

  // Add Teacher Form
  const [addForm, setAddForm] = useState({ name: '', phone: '', subject: '', password: '' });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profile || profile.role !== 'super_admin') {
        router.push('/');
        return;
      }

      await fetchTeachers();
      await fetchActivationCodes();
    } catch (err) {
      console.error("Auth error", err);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'super_admin')
        .order('created_at', { ascending: false });

      console.log('Fetched Profiles:', data, error);

      if (error && error.code !== 'PGRST116') throw error;
      
      const formattedData = (data || []).map((t: any) => ({
        ...t,
        status: t.status || 'active',
        subscription_plan: t.subscription_plan || 'monthly',
        role: t.role || 'teacher',
        subscription_expires_at: t.subscription_expires_at || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
      }));

      setTeachers(formattedData);
    } catch (err) {
      toast.error("فشل في تحميل بيانات المعلمين");
    }
  };

  const handleToggleStatus = async (teacher: TeacherProfile) => {
    const newStatus = teacher.status === 'active' ? 'suspended' : 'active';
    try {
      await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', teacher.id);
      
      toast.success(`تم ${newStatus === 'active' ? 'تفعيل' : 'إيقاف'} حساب المعلم`);
      fetchTeachers();
    } catch (err) {
      toast.error("فشل في تحديث الحالة");
    }
  };

  const handleExtendSubscription = async (months: number) => {
    if (!selectedTeacher) return;
    
    const currentDate = selectedTeacher.subscription_expires_at 
      ? new Date(selectedTeacher.subscription_expires_at) 
      : new Date();
      
    if (currentDate < new Date()) {
      currentDate.setTime(new Date().getTime());
    }

    currentDate.setMonth(currentDate.getMonth() + months);

    try {
      await supabase
        .from('profiles')
        .update({ 
          subscription_expires_at: currentDate.toISOString(),
          status: 'active'
        })
        .eq('id', selectedTeacher.id);
      
      toast.success("تم تجديد الاشتراك بنجاح");
      setIsExtendModalOpen(false);
      fetchTeachers();
    } catch (err) {
      toast.error("فشل في تجديد الاشتراك");
    }
  };

  const handleDeleteTeacher = async () => {
    if (!selectedTeacher) return;
    
    try {
      // In a real app with proper RLS, you'd call an edge function or use service_role to delete the auth.user
      // Here we just delete the profile for demo purposes if RLS allows, or rely on cascading
      await supabase.from('profiles').delete().eq('id', selectedTeacher.id);
      
      toast.success("تم حذف المعلم بنجاح");
      setIsDeleteModalOpen(false);
      fetchTeachers();
    } catch (err) {
      toast.error("فشل في الحذف");
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("جاري إضافة المعلم...");
    try {
      // Create user auth
      const internalEmail = `${addForm.phone}@center.app`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: internalEmail,
        password: addForm.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        await supabase.from('profiles').upsert([{
          id: authData.user.id,
          role: 'teacher',
          full_name: addForm.name,
          subject: addForm.subject,
          phone: addForm.phone,
          status: 'active',
          subscription_plan: 'basic',
          subscription_expires_at: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
        }]);
      }

      toast.success("تم إضافة المعلم بنجاح", { id: toastId });
      setIsAddModalOpen(false);
      setAddForm({ name: '', phone: '', subject: '', password: '' });
      fetchTeachers();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء الإضافة", { id: toastId });
    }
  };

  const fetchActivationCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('activation_codes')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (data) setActivationCodes(data);
    } catch (err) {
      console.error("Error fetching codes:", err);
    }
  };

  const generateRandomCode = (months: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomStr = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const periodStr = months === 120 ? 'LIFE' : months === 12 ? '1Y' : months === 6 ? '6M' : '1M';
    return `MOALEM-${periodStr}-${randomStr}`;
  };

  const handleGenerateCode = async () => {
    const code = generateRandomCode(generateCodeDuration);

    const toastId = toast.loading("جاري توليد الكود...");
    try {
      const { error } = await supabase.from('activation_codes').insert([{
        code: code,
        duration_months: generateCodeDuration,
        is_used: false
      }]);

      if (error) {
        console.error('Supabase Insert Error:', error);
        throw error;
      }

      toast.success("تم توليد الكود بنجاح", { id: toastId });
      setIsGenerateCodeModalOpen(false);
      fetchActivationCodes();
    } catch (err) {
      console.error('Supabase Insert Error:', err);
      toast.error("فشل في توليد الكود", { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B1120]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeCount = teachers.filter(t => t.status === 'active' || !t.status).length;
  const suspendedCount = teachers.filter(t => t.status === 'suspended').length;
  const expiringSoonCount = teachers.filter(t => {
    if (!t.subscription_expires_at) return false;
    const daysLeft = (new Date(t.subscription_expires_at).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return daysLeft > 0 && daysLeft <= 7;
  }).length;

  const filteredTeachers = teachers.filter(t => 
    (t.full_name?.includes(searchQuery) || t.phone?.includes(searchQuery))
  );

  return (
    <div className="min-h-screen bg-[#0B1120] text-white font-sans selection:bg-indigo-500/30 pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#111827]/80 border-b border-gray-800">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">لوحة تحكم الإدارة</h1>
              <p className="text-xs text-red-400">Super Admin Access</p>
            </div>
          </div>
          
          <button 
            onClick={() => { supabase.auth.signOut(); router.push('/'); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> خروج
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-white">{teachers.length}</h3>
            </div>
            <p className="text-gray-400 font-medium">إجمالي المعلمين</p>
          </div>
          
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-white">{activeCount}</h3>
            </div>
            <p className="text-gray-400 font-medium">اشتراكات نشطة</p>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-white">{expiringSoonCount}</h3>
            </div>
            <p className="text-gray-400 font-medium">تنتهي خلال 7 أيام</p>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
                <Ban className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-white">{suspendedCount}</h3>
            </div>
            <p className="text-gray-400 font-medium">حسابات موقوفة</p>
          </div>
        </div>

        {/* Teachers Table Section */}
        <div className="bg-[#111827] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#0B1120]/50">
            <div className="relative w-full sm:w-96">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="ابحث بالاسم أو رقم الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111827] border border-gray-700 rounded-xl py-3 pr-12 pl-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
              <button 
                onClick={() => setIsGenerateCodeModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 rounded-xl font-bold transition-all"
              >
                🔑 توليد كود تفعيل
              </button>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-5 h-5" /> معلم جديد
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-[#1f2937]/50 text-gray-400 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">اسم المعلم والمادة</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">رقم الهاتف</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">حالة الاشتراك</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">تاريخ الانتهاء</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50 text-sm">
                {filteredTeachers.map((teacher) => {
                  
                  let statusColor = "bg-green-500/10 text-green-400 border-green-500/20";
                  let statusText = "نشط";
                  
                  if (teacher.status === 'suspended') {
                    statusColor = "bg-gray-500/10 text-gray-400 border-gray-500/20";
                    statusText = "موقوف";
                  } else if (teacher.subscription_expires_at) {
                    const daysLeft = (new Date(teacher.subscription_expires_at).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
                    if (daysLeft < 0) {
                      statusColor = "bg-red-500/10 text-red-400 border-red-500/20";
                      statusText = "منتهي";
                    } else if (daysLeft <= 7) {
                      statusColor = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
                      statusText = "قارب على الانتهاء";
                    }
                  }

                  return (
                    <tr key={teacher.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white mb-1">{teacher.full_name}</div>
                        <div className="text-xs text-gray-500">{teacher.subject || 'غير محدد'}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-300" dir="ltr">
                        {teacher.phone}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${statusColor}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {teacher.subscription_expires_at ? new Date(teacher.subscription_expires_at).toLocaleDateString('ar-EG') : 'غير محدد'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => { setSelectedTeacher(teacher); setIsExtendModalOpen(true); }}
                            className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors"
                            title="تجديد الاشتراك"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(teacher)}
                            className={`p-2 rounded-lg transition-colors ${teacher.status === 'suspended' ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'}`}
                            title={teacher.status === 'suspended' ? 'تفعيل' : 'إيقاف'}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => { setSelectedTeacher(teacher); setIsDeleteModalOpen(true); }}
                            className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredTeachers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      لا يوجد معلمين مطابقين للبحث
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Generated Codes List Section */}
        <div className="bg-[#111827] rounded-3xl p-6 border border-gray-800 shadow-xl mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">أكواد التفعيل المولدة</h2>
              <p className="text-sm text-gray-400 mt-1">إدارة أكواد التفعيل التي تم توليدها</p>
            </div>
            <button 
              onClick={() => fetchActivationCodes()}
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              تحديث القائمة
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-[#1f2937]/50 text-gray-400 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">الكود</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">الباقة</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">المدة</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">الحالة</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {activationCodes.length > 0 ? (
                  activationCodes.map((code) => (
                    <tr key={code.id} className="hover:bg-[#1f2937]/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-white tracking-wider">
                        {code.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {code.plan_name || (code.duration_months === 6 ? 'ذهبية' : code.duration_months === 12 ? 'ماسية' : code.duration_months === 120 ? 'ملكية' : 'شهرية')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {code.duration_months === 120 ? 'مدى الحياة' : `${code.duration_months} شهر`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          code.is_used ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}>
                          {code.is_used ? 'مُستخدم' : 'غير مُستخدم'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(code.code);
                            toast.success("تم نسخ الكود");
                          }}
                          className="text-indigo-400 hover:text-indigo-300 hover:underline text-sm font-medium"
                        >
                          نسخ الكود
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      لا يوجد أكواد مولدة حتى الآن
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Extend Subscription Modal */}
      {isExtendModalOpen && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111827] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-800">
            <div className="p-6 border-b border-gray-800 bg-[#0B1120]/50 flex justify-between items-center">
              <h3 className="font-bold text-lg">تجديد الاشتراك</h3>
              <button onClick={() => setIsExtendModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-400 text-sm">اختر مدة التجديد للمعلم <strong className="text-white">{selectedTeacher.full_name}</strong></p>
              
              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => handleExtendSubscription(1)} className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 font-bold hover:bg-indigo-500/20 transition-colors">
                  شهر واحد
                </button>
                <button onClick={() => handleExtendSubscription(6)} className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 font-bold hover:bg-indigo-500/20 transition-colors">
                  6 أشهر
                </button>
                <button onClick={() => handleExtendSubscription(12)} className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 font-bold hover:bg-indigo-500/20 transition-colors">
                  سنة كاملة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-red-500/50">
            <div className="p-6 border-b border-gray-800 bg-red-500/10 flex justify-between items-center">
              <h3 className="font-bold text-lg text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> تحذير نهائي
              </h3>
            </div>
            <div className="p-6 space-y-4 text-center">
              <p className="text-gray-300">
                هل أنت متأكد من حذف المعلم <strong className="text-white">{selectedTeacher.full_name}</strong>؟ 
                سيؤدي هذا لحذف كافة بياناته، ولا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition-colors">
                  إلغاء
                </button>
                <button onClick={handleDeleteTeacher} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">
                  نعم، احذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111827] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-800">
            <div className="p-6 border-b border-gray-800 bg-[#0B1120]/50 flex justify-between items-center">
              <h3 className="font-bold text-lg">إضافة معلم جديد</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTeacher} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-400">الاسم بالكامل</label>
                <input required type="text" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} className="w-full bg-[#0B1120] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">المادة الدراسية</label>
                <input required type="text" value={addForm.subject} onChange={e => setAddForm({...addForm, subject: e.target.value})} className="w-full bg-[#0B1120] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">رقم الهاتف</label>
                <input required type="tel" dir="ltr" value={addForm.phone} onChange={e => setAddForm({...addForm, phone: e.target.value})} className="w-full bg-[#0B1120] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">كلمة المرور الابتدائية</label>
                <input required type="text" dir="ltr" value={addForm.password} onChange={e => setAddForm({...addForm, password: e.target.value})} className="w-full bg-[#0B1120] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none font-mono" />
              </div>
              
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors mt-6 shadow-lg shadow-indigo-500/20">
                تسجيل وحفظ
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Generate Code Modal */}
      {isGenerateCodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111827] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-800">
            <div className="p-6 border-b border-gray-800 bg-[#0B1120]/50 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="text-xl">🔑</span> توليد كود تفعيل
              </h3>
              <button onClick={() => setIsGenerateCodeModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-400">اختر مدة الباقة لتوليد كود جديد</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setGenerateCodeDuration(1)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors border ${generateCodeDuration === 1 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#0B1120] border-gray-700 text-gray-300 hover:border-gray-500'}`}
                >
                  شهر واحد
                </button>
                <button 
                  onClick={() => setGenerateCodeDuration(6)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors border ${generateCodeDuration === 6 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#0B1120] border-gray-700 text-gray-300 hover:border-gray-500'}`}
                >
                  6 أشهر
                </button>
                <button 
                  onClick={() => setGenerateCodeDuration(12)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors border ${generateCodeDuration === 12 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#0B1120] border-gray-700 text-gray-300 hover:border-gray-500'}`}
                >
                  سنة كاملة
                </button>
                <button 
                  onClick={() => setGenerateCodeDuration(120)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors border ${generateCodeDuration === 120 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#0B1120] border-gray-700 text-gray-300 hover:border-gray-500'}`}
                >
                  مدى الحياة
                </button>
              </div>

              <button 
                onClick={handleGenerateCode}
                className="w-full py-4 mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
              >
                توليد الكود الآن
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

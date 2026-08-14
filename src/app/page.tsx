"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
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
  FileText,
  MoreVertical,
  BarChart,
  PhoneCall,
  Trash2,
  BookCheck,
  Clock,
  MessageSquare,
  Edit,
  LayoutDashboard,
  Library,
  Crown,
  CheckCircle,
  ShieldCheck,
  Award,
  Smartphone,
  Cloud,
  Upload,
  LogOut,
  Lock,
  Mail,
  Sparkles
} from "lucide-react";

const formatTime12h = (timeStr: string) => {
  if (!timeStr) return "";
  const [hourStr, minute] = timeStr.split(":");
  if (!hourStr || !minute) return timeStr;
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "م" : "ص";
  hour = hour % 12;
  hour = hour ? hour : 12; 
  return `${hour}:${minute} ${ampm}`;
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("الرئيسية");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState("");
  const [teacherPhone, setTeacherPhone] = useState("");
  const [teacherPlan, setTeacherPlan] = useState("");
  const [teacherExpires, setTeacherExpires] = useState<string | null>(null);
  const [activationCode, setActivationCode] = useState("");
  const [session, setSession] = useState<any>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  
  // Auth Modes & States
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loginRole, setLoginRole] = useState<'teacher' | 'assistant'>('teacher');
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Signup States
  const [signupRole, setSignupRole] = useState<'teacher' | 'assistant'>('teacher');
  const [signupName, setSignupName] = useState("");
  const [signupSubject, setSignupSubject] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");

  // Assistant Management States
  const [preAuthorizedAssistants, setPreAuthorizedAssistants] = useState<any[]>([]);
  const [assistantForm, setAssistantForm] = useState({ name: '', phone: '' });
  const [isSubmittingAssistant, setIsSubmittingAssistant] = useState(false);
  const [isLoadingAssistants, setIsLoadingAssistants] = useState(true);

  // PWA & Cloud Backup States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isBackupMenuOpen, setIsBackupMenuOpen] = useState(false);
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authentication & Session Management
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Auth check result:', session);
      
      setSession(session);
      if (session) {
        await handleRoleFetching(session.user.id);
      } else {
        setIsCheckingSession(false);
      }
    };

    fetchSession();

    // Rehydrate active tab
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
      setActiveTab(savedTab);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      if (session) {
        setIsCheckingSession(true); // Re-lock rendering during role fetch
        setSession(session);
        await handleRoleFetching(session.user.id);
      } else {
        setSession(null);
        setUserRole(null);
        setTeacherId(null);
        setIsCheckingSession(false);
      }
    });

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);
  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const handleExportData = async () => {
    if (!teacherId) return;
    const toastId = toast.loading("جاري تصدير البيانات...");
    try {
      const [
        { data: students },
        { data: groups },
        { data: attendance },
        { data: payments },
        { data: homework },
        { data: exams },
        { data: recitation }
      ] = await Promise.all([
        supabase.from('students').select('*').eq('teacher_id', teacherId),
        supabase.from('groups').select('*').eq('teacher_id', teacherId),
        supabase.from('attendance').select('*').eq('teacher_id', teacherId),
        supabase.from('payments').select('*').eq('teacher_id', teacherId),
        supabase.from('homework').select('*').eq('teacher_id', teacherId),
        supabase.from('exams').select('*').eq('teacher_id', teacherId),
        supabase.from('recitation').select('*').eq('teacher_id', teacherId)
      ]);

      const backup = {
        timestamp: new Date().toISOString(),
        teacher_id: teacherId,
        data: { students, groups, attendance, payments, homework, exams, recitation }
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `moalemy-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("تم تصدير البيانات بنجاح", { id: toastId });
      setIsBackupMenuOpen(false);
    } catch (err) {
      toast.error("فشل في تصدير البيانات", { id: toastId });
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !teacherId) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const toastId = toast.loading("جاري استيراد البيانات...");
      try {
        const backup = JSON.parse(event.target?.result as string);
        if (!backup.data || !backup.teacher_id) {
          throw new Error("ملف غير صالح");
        }
        
        const importToTable = async (table: string, records: any[]) => {
          if (!records || records.length === 0) return;
          const cleanRecords = records.map(r => ({ ...r, teacher_id: teacherId }));
          await supabase.from(table).upsert(cleanRecords);
        };

        await Promise.all([
          importToTable('students', backup.data.students),
          importToTable('groups', backup.data.groups),
          importToTable('attendance', backup.data.attendance),
          importToTable('payments', backup.data.payments),
          importToTable('homework', backup.data.homework),
          importToTable('exams', backup.data.exams),
          importToTable('recitation', backup.data.recitation)
        ]);

        toast.success("تم استيراد البيانات بنجاح", { id: toastId });
        window.location.reload();
      } catch (err) {
        toast.error("فشل في استيراد البيانات", { id: toastId });
      }
    };
    reader.readAsText(file);
    setIsBackupMenuOpen(false);
  };

  const handleClearData = async () => {
    if (clearConfirmText !== "مسح" || !teacherId) {
      return toast.error("يرجى كتابة كلمة مسح للتأكيد");
    }
    const toastId = toast.loading("جاري مسح البيانات...");
    try {
      await Promise.all([
        supabase.from('students').delete().eq('teacher_id', teacherId),
        supabase.from('groups').delete().eq('teacher_id', teacherId),
        supabase.from('attendance').delete().eq('teacher_id', teacherId),
        supabase.from('payments').delete().eq('teacher_id', teacherId),
        supabase.from('homework').delete().eq('teacher_id', teacherId),
        supabase.from('exams').delete().eq('teacher_id', teacherId),
        supabase.from('recitation').delete().eq('teacher_id', teacherId)
      ]);
      toast.success("تم مسح كافة البيانات", { id: toastId });
      setIsClearDataModalOpen(false);
      setClearConfirmText("");
      window.location.reload();
    } catch (err) {
      toast.error("حدث خطأ أثناء المسح", { id: toastId });
    }
  };


  const handleRoleFetching = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching profile:", error);
      }

      if (profile) {
        setUserRole(profile.role);
        setTeacherId(profile.role === 'teacher' ? userId : profile.teacher_id);
        setTeacherName(profile.full_name || "");
        setTeacherPhone(profile.phone || "");
        setTeacherPlan(profile.subscription_plan || "monthly");
        setTeacherExpires(profile.subscription_expires_at || null);
      } else {
        // Fallback if no profile exists
        setUserRole('teacher');
        setTeacherId(userId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const handleActivateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationCode.trim() || !session?.user?.id) return;

    const toastId = toast.loading("جاري التحقق من الكود...");
    try {
      // 1. Validate Code
      const { data: codeData, error: codeError } = await supabase
        .from('activation_codes')
        .select('*')
        .eq('code', activationCode.trim())
        .single();

      if (codeError || !codeData) {
        throw new Error("كود التفعيل غير صحيح أو غير موجود");
      }
      if (codeData.is_used) {
        throw new Error("كود التفعيل مستخدم من قبل");
      }

      // 2. Calculate new expiration
      const currentDate = teacherExpires ? new Date(teacherExpires) : new Date();
      if (currentDate < new Date()) {
        currentDate.setTime(new Date().getTime());
      }
      currentDate.setMonth(currentDate.getMonth() + (codeData.duration_months || 1));

      // 3. Update Profile
      const planName = codeData.plan_name || "باقة مدفوعة";
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          subscription_expires_at: currentDate.toISOString(),
          subscription_plan: planName,
          status: 'active'
        })
        .eq('id', session.user.id);
        
      if (profileError) throw profileError;

      // 4. Mark code as used
      await supabase
        .from('activation_codes')
        .update({ is_used: true, used_by: session.user.id, used_at: new Date().toISOString() })
        .eq('code', activationCode.trim());

      setTeacherExpires(currentDate.toISOString());
      setTeacherPlan(planName);
      setActivationCode("");
      toast.success(`تم التفعيل بنجاح! تم تطبيق الباقة: ${planName}`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء التفعيل", { id: toastId });
    }
  };

  const getCleanPhone = (phone: string) => {
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('01')) {
      clean = '2' + clean;
    }
    return clean;
  };

  const getInternalEmail = (phone: string) => {
    return `${getCleanPhone(phone)}@center.app`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    
    const internalEmail = getInternalEmail(loginPhone);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: internalEmail,
      password: loginPassword,
    });

    if (error) {
      setLoginError("رقم الهاتف أو كلمة المرور غير صحيحة.");
    }
    setIsLoggingIn(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    setIsLoggingIn(true);
    const cleanPhone = getCleanPhone(signupPhone);
    const internalEmail = getInternalEmail(signupPhone);
    
    let assignedTeacherId = null;
    let finalName = signupName;
    
    if (signupRole === 'assistant') {
      try {
        const { data: preAuthData } = await supabase
          .from('pre_authorized_assistants')
          .select('*')
          .eq('phone', cleanPhone)
          .single();
          
        if (preAuthData) {
          assignedTeacherId = preAuthData.teacher_id;
          finalName = preAuthData.name;
        } else {
          setLoginError("رقم الهاتف هذا غير مصرح له كمساعد. يرجى طلب إضافتك من المعلم أولاً");
          setIsLoggingIn(false);
          return;
        }
      } catch (e) {
        setLoginError("رقم الهاتف هذا غير مصرح له كمساعد. يرجى طلب إضافتك من المعلم أولاً");
        setIsLoggingIn(false);
        return;
      }
    } else {
      if (!finalName || !signupSubject) {
        setLoginError("يرجى إكمال جميع بيانات المعلم");
        setIsLoggingIn(false);
        return;
      }
      if (signupPassword !== signupConfirm) {
        setLoginError("كلمة المرور غير متطابقة.");
        setIsLoggingIn(false);
        return;
      }
    }
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: internalEmail,
      password: signupPassword,
      options: {
        data: {
          full_name: finalName,
          subject: signupRole === 'teacher' ? signupSubject : null,
          phone: cleanPhone,
          role: signupRole,
          teacher_id: assignedTeacherId
        }
      }
    });

    if (authError) {
      setLoginError(`حدث خطأ في التسجيل: ${authError.message}`);
      setIsLoggingIn(false);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').upsert([{
        id: authData.user.id,
        role: signupRole,
        teacher_id: assignedTeacherId,
        full_name: finalName,
        subject: signupRole === 'teacher' ? signupSubject : null,
        phone: cleanPhone
      }]);
      
      if (profileError) {
        console.error("Profile creation error:", profileError);
        setLoginError("تم إنشاء الحساب ولكن حدث خطأ في تحديث الملف الشخصي.");
      } else {
        toast.success(signupRole === 'assistant' ? "تم تفعيل حساب المساعد بنجاح! جاري تسجيل الدخول..." : "تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...");
        
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: internalEmail,
          password: signupPassword,
        });

        if (signInError) {
          setLoginError("تم إنشاء الحساب ولكن فشل تسجيل الدخول التلقائي.");
          setAuthMode('signin');
        } else {
          setSignupName("");
          setSignupSubject("");
          setSignupPhone("");
          setSignupPassword("");
          setSignupConfirm("");
        }
      }
    }
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    if (userRole === 'assistant' && activeTab === 'المالية') {
      setActiveTab('الرئيسية');
    }
  }, [userRole, activeTab]);

  // Fetch Pre-Authorized Assistants
  useEffect(() => {
    if (!teacherId || userRole !== 'teacher') return;
    const fetchAssistants = async () => {
      setIsLoadingAssistants(true);
      const { data, error } = await supabase
        .from('pre_authorized_assistants')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });
      if (error && error.code !== '42P01') { 
        console.error("فشل في تحميل المساعدين", error);
      } else {
        setPreAuthorizedAssistants(data || []);
      }
      setIsLoadingAssistants(false);
    };
    fetchAssistants();
  }, [teacherId, userRole]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isPrivateModalOpen, setIsPrivateModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [activeGroupFilter, setActiveGroupFilter] = useState("الكل");
  const [scheduleView, setScheduleView] = useState<"احترافي" | "تقليدي">("احترافي");

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedGroupView, setSelectedGroupView] = useState<Group | null>(null);
  const [studentProfileTab, setStudentProfileTab] = useState("الحضور");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [activeStudentFilter, setActiveStudentFilter] = useState("الكل");
  const [contactStudentInfo, setContactStudentInfo] = useState<Student | null>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsappMode, setWhatsappMode] = useState<'system' | 'custom'>('system');
  const [customWhatsappTemplate, setCustomWhatsappTemplate] = useState<string>('');
  const [whatsappAppType, setWhatsappAppType] = useState<'normal' | 'business'>('normal');
  const [whatsappStudent, setWhatsappStudent] = useState<Student | null>(null);

  type Group = { id: string; name: string; subject: string; type: string; price: number; whatsapp_link?: string; created_at: string; schedules?: {day: string, time: string}[] };
  type Student = { id: string; full_name: string; group_id: string; student_phone?: string; parent_phone?: string; created_at: string; };
  type Payment = { id: string; student_id: string; group_id?: string; amount?: number; amount_paid?: number; amount_remaining?: number; status?: string; payment_status?: string; payment_date: string; month?: string; };
  type Material = { id: string; name: string; group_id: string; cost: number; price: number; created_at: string; };
  type MaterialDistribution = { id: string; student_id: string; material_id: string; status: 'تم التسليم' | 'لم يستلم'; created_at: string; };

  const [homeworkHistory, setHomeworkHistory] = useState<any[]>([]);
  const [examsHistory, setExamsHistory] = useState<any[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [recitationHistory, setRecitationHistory] = useState<any[]>([]);
  
  const [hwForm, setHwForm] = useState({ date: '', status: 'كتب الواجب', notes: '' });
  const [paymentForm, setPaymentForm] = useState(() => {
    const today = new Date();
    return { 
      month: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`, 
      date: today.toISOString().split('T')[0], 
      status: 'مدفوع' 
    };
  });
  const [examForm, setExamForm] = useState({ name: '', date: '', score: '', total_score: '', notes: '' });
  const [attendanceForm, setAttendanceForm] = useState({ date: '', status: 'حاضر', notes: '' });
  const [recitationForm, setRecitationForm] = useState({ date: '', grade: 'ممتاز', notes: '' });

  const [isSubmittingHw, setIsSubmittingHw] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);
  const [isSubmittingRecitation, setIsSubmittingRecitation] = useState(false);

  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [editStudentForm, setEditStudentForm] = useState<Student | null>(null);
  const [isSubmittingEditStudent, setIsSubmittingEditStudent] = useState(false);

  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);

  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialDistributions, setMaterialDistributions] = useState<MaterialDistribution[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
  
  const [financialGroupType, setFinancialGroupType] = useState("الكل");
  const [financialGroup, setFinancialGroup] = useState("");
  const [financialMonth, setFinancialMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [financialTab, setFinancialTab] = useState("الكل");
  
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);

  useEffect(() => {
    if (!teacherId) return;
    const fetchGroups = async () => {
      setIsLoadingGroups(true);
      try {
        const { data, error } = await supabase.from('groups').select('*').eq('teacher_id', teacherId).order('created_at', { ascending: false });
        if (error && error.code !== 'PGRST116') console.error("Error fetching groups:", error);
        setGroups(data || []);
      } catch (err) {
        console.error(err);
        setGroups([]);
      }
      setIsLoadingGroups(false);
    };
    fetchGroups();
  }, [teacherId]);

  useEffect(() => {
    if (!teacherId) return;
    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      try {
        const { data, error } = await supabase.from('students').select('*').eq('teacher_id', teacherId).order('created_at', { ascending: false });
        if (error && error.code !== 'PGRST116') console.error("Error fetching students:", error);
        setStudents(data || []);
      } catch (err) {
        console.error(err);
        setStudents([]);
      }
      setIsLoadingStudents(false);
    };
    fetchStudents();
  }, [teacherId]);

  useEffect(() => {
    if (!teacherId) return;
    const fetchPayments = async () => {
      setIsLoadingPayments(true);
      try {
        const { data, error } = await supabase.from('payments').select('*').eq('teacher_id', teacherId).order('payment_date', { ascending: false });
        if (error && error.code !== 'PGRST116') console.error("Error fetching payments:", error);
        setPayments(data || []);
      } catch (err) {
        console.error(err);
        setPayments([]);
      }
      setIsLoadingPayments(false);
    };
    fetchPayments();
  }, [teacherId]);

  useEffect(() => {
    if (!teacherId) return;
    const fetchMaterials = async () => {
      setIsLoadingMaterials(true);
      try {
        const [materialsRes, distRes] = await Promise.all([
          supabase.from('materials').select('*').eq('teacher_id', teacherId).order('id', { ascending: false }),
          supabase.from('material_distributions').select('*').eq('teacher_id', teacherId).order('id', { ascending: false })
        ]);
        
        if (materialsRes.error && materialsRes.error.code !== 'PGRST116') {
          console.error("Fetch Material Error Details:", materialsRes.error?.message, materialsRes.error?.details, materialsRes.error?.hint);
        }
        setMaterials(materialsRes.data || []);
        
        if (distRes.error && distRes.error.code !== 'PGRST116') console.error("Error fetching distributions:", distRes.error);
        setMaterialDistributions(distRes.data || []);
      } catch (err) {
        console.error(err);
        setMaterials([]);
        setMaterialDistributions([]);
      }
      setIsLoadingMaterials(false);
    };
    fetchMaterials();
  }, [teacherId]);

  useEffect(() => {
    const savedTemplate = localStorage.getItem('whatsapp_custom_template');
    if (savedTemplate) setCustomWhatsappTemplate(savedTemplate);
  }, []);

  // --- Financial Engine Analytics ---
  // Filter students based on financialGroupType and financialGroup
  const financialFilteredStudents = students.filter(student => {
    const group = groups.find(g => g.id === student.group_id);
    if (!group) return false;
    
    // Group Type Filter
    let typeMatch = true;
    if (financialGroupType === "سنتر") typeMatch = group.type === "center";
    else if (financialGroupType === "أونلاين") typeMatch = group.type === "online";
    else if (financialGroupType === "برايفت") typeMatch = group.type === "private_group" || group.type === "private_student";
    
    // Specific Group Filter
    const groupMatch = financialGroup === "" || student.group_id === financialGroup;
    
    return typeMatch && groupMatch;
  });

  // Calculate live metrics for the selected month
  let totalExpected = 0;
  let totalCollected = 0;
  let studentsWithDues = 0;
  
  const financialStudentsData = financialFilteredStudents.map(student => {
    const group = groups.find(g => g.id === student.group_id);
    const price = group?.price || 0;
    totalExpected += price;
    
    // Check if there is a payment record for this student for the selected month
    const paymentRecord = payments.find(p => p.student_id === student.id && p.month === financialMonth);
    
    let isPaid = false;
    if (paymentRecord && paymentRecord.status === "مدفوع") {
      isPaid = true;
      totalCollected += price;
    } else {
      studentsWithDues += 1;
    }
    
    return {
      student,
      group,
      isPaid,
      paymentRecord,
      price
    };
  });
  
  let totalMaterialsSales = 0;
  let totalMaterialsCost = 0;
  financialFilteredStudents.forEach(student => {
    const studentDistributions = materialDistributions.filter(d => d.student_id === student.id && d.status === 'تم التسليم');
    studentDistributions.forEach(dist => {
      const material = materials.find(m => m.id === dist.material_id);
      if (material) {
        totalMaterialsSales += Number(material.price || 0);
        totalMaterialsCost += Number(material.cost || 0);
      }
    });
  });
  
  let materialsNetProfit = totalMaterialsSales - totalMaterialsCost;
  let totalNetIncome = totalCollected + materialsNetProfit;
  
  let totalRemaining = totalExpected - totalCollected;
  
  // Filter the mapped array based on the payment status tab
  const displayedFinancialStudents = financialStudentsData.filter(data => {
    if (financialTab === "مدفوع") return data.isPaid;
    if (financialTab === "متبقي") return !data.isPaid;
    return true; // "الكل"
  });

  const handleTogglePayment = async (studentId: string, groupId: string | undefined, isCurrentlyPaid: boolean) => {
    if (!groupId) return;
    const toastId = toast.loading("جاري تحديث الدفع...");
    
    try {
      if (isCurrentlyPaid) {
        // Find and delete the record
        const paymentRecord = payments.find(p => p.student_id === studentId && p.month === financialMonth);
        if (paymentRecord) {
          const { error } = await supabase.from('payments').delete().eq('id', paymentRecord.id);
          if (error) throw error;
          setPayments(prev => prev.filter(p => p.id !== paymentRecord.id));
        }
      } else {
        // Insert a new record
        const group = groups.find(g => g.id === groupId);
        const payload = {
          student_id: studentId,
          group_id: groupId,
          amount: group?.price || 0,
          month: financialMonth,
          status: "مدفوع",
          payment_date: new Date().toISOString()
        };
        const { data, error } = await supabase.from('payments').insert([{ ...payload, teacher_id: teacherId }]).select();
        if (error) throw error;
        if (data) setPayments(prev => [...prev, data[0]]);
      }
      toast.success("تم التحديث بنجاح", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء التحديث", { id: toastId });
    }
  };

  const handlePrintFinancialReport = () => {
    let rowsHtml = '';
    displayedFinancialStudents.forEach((data, idx) => {
      const statusHtml = data.isPaid 
        ? `<span style="color: #10b981; font-weight: bold;">تم الدفع (${data.price} ج.م)</span>`
        : `<span style="color: #ef4444; font-weight: bold;">لم يدفع (0 ج.م)</span>`;
        
      rowsHtml += `
        <tr style="background-color: ${idx % 2 === 0 ? '#f9fafb' : '#ffffff'};">
          <td style="border: 1px solid #ddd; padding: 12px 8px; text-align: center; font-weight: bold; color: #4b5563;">${idx + 1}</td>
          <td style="border: 1px solid #ddd; padding: 12px 16px; font-weight: 600; color: #111827;">${data.student.full_name}</td>
          <td style="border: 1px solid #ddd; padding: 12px 16px; color: #4b5563;">${data.group?.name || '-'}</td>
          <td style="border: 1px solid #ddd; padding: 12px 16px; text-align: center;">${statusHtml}</td>
        </tr>
      `;
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>السجل المالي - ${financialMonth}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
          body {
            font-family: 'Cairo', sans-serif;
            margin: 0;
            padding: 20px;
            color: #111827;
            background: #fff;
          }
          .header-banner {
            background-color: #231545;
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
          }
          .header-title { margin: 0; font-size: 24px; font-weight: 800; }
          .header-subtitle { margin-top: 10px; font-size: 14px; opacity: 0.9; }
          .metrics-grid {
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
          }
          .metric-card {
            flex: 1;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .metric-title { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
          .metric-value { font-size: 20px; font-weight: bold; color: #111827; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f3f4f6; color: #374151; font-weight: bold; padding: 12px 8px; border: 1px solid #ddd; }
          @media print {
            body { padding: 0; }
            .header-banner { border-radius: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .metric-card { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        <div class="header-banner">
          <h1 class="header-title">السجل المالي</h1>
          <div class="header-subtitle">الفترة: ${financialMonth} • التصفية: ${financialGroupType} ${financialGroup ? '• مجموعة محددة' : ''}</div>
        </div>
        
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-title">إجمالي الاشتراكات</div>
            <div class="metric-value" style="color: #10b981;">${totalCollected} ج.م</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">أرباح الملازم</div>
            <div class="metric-value" style="color: #8b5cf6;">${materialsNetProfit} ج.م</div>
          </div>
          <div class="metric-card" style="background: #e0f2fe; border: 1px solid #7dd3fc;">
            <div class="metric-title" style="color: #0369a1;">إجمالي الدخل</div>
            <div class="metric-value" style="color: #0284c7;">${totalNetIncome} ج.م</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">الديون (اشتراكات)</div>
            <div class="metric-value" style="color: #ef4444;">${totalRemaining} ج.م</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>اسم الطالب</th>
              <th>المجموعة</th>
              <th style="width: 150px;">حالة الدفع</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="4" style="text-align: center; padding: 20px; border: 1px solid #ddd;">لا توجد سجلات دفع مطابقة</td></tr>'}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const contentDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (contentDoc) {
      contentDoc.open();
      contentDoc.write(htmlContent);
      contentDoc.close();
    }
    
    setTimeout(() => {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    }, 500);
  };

  const [materialForm, setMaterialForm] = useState({ name: '', group_id: '', cost: '', price: '' });
  const [isSubmittingMaterial, setIsSubmittingMaterial] = useState(false);
  
  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.name || !materialForm.group_id) return toast.error("يرجى إدخال اسم الملزمة والمجموعة");
    
    setIsSubmittingMaterial(true);
    const payload = {
      name: materialForm.name,
      group_id: materialForm.group_id,
      cost: Number(materialForm.cost) || 0,
      price: Number(materialForm.price) || 0
    };
    
    const { data, error } = await supabase.from('materials').insert([{ ...payload, teacher_id: teacherId }]).select();
    setIsSubmittingMaterial(false);
    
    if (error) {
      console.error("Insert Material Error Details:", error?.message, error?.details, error?.hint);
      toast.error("فشل في إضافة الملزمة");
    } else if (data) {
      setMaterials(prev => [data[0], ...prev]);
      setMaterialForm({ name: '', group_id: '', cost: '', price: '' });
      toast.success("تم إضافة الملزمة بنجاح");
    }
  };

  const handleToggleMaterialDistribution = async (materialId: string, studentId: string, isDelivered: boolean) => {
    const toastId = toast.loading("جاري التحديث...");
    try {
      if (isDelivered) {
        // Delete record
        const dist = materialDistributions.find(d => d.material_id === materialId && d.student_id === studentId);
        if (dist) {
          const { error } = await supabase.from('material_distributions').delete().eq('id', dist.id);
          if (error) throw error;
          setMaterialDistributions(prev => prev.filter(d => d.id !== dist.id));
        }
      } else {
        // Insert record
        const payload = { material_id: materialId, student_id: studentId, status: 'تم التسليم' };
        const { data, error } = await supabase.from('material_distributions').insert([{ ...payload, teacher_id: teacherId }]).select();
        if (error) throw error;
        if (data) setMaterialDistributions(prev => [...prev, data[0]]);
      }
      toast.success("تم التحديث", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء التحديث", { id: toastId });
    }
  };

  const handlePrintCertificate = (student: Student, exam: any) => {
    const group = groups.find(g => g.id === student.group_id);
    const date = new Date().toLocaleDateString('ar-EG');
    const scorePercentage = (Number(exam.score) / Number(exam.total_score)) * 100;
    
    let appreciationWord = "تقدير ممتاز";
    if (scorePercentage < 85 && scorePercentage >= 75) appreciationWord = "تقدير جيد جداً";
    else if (scorePercentage < 75 && scorePercentage >= 65) appreciationWord = "تقدير جيد";
    else if (scorePercentage < 65) appreciationWord = "شهادة مشاركة";

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>شهادة تقدير - ${student.full_name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Cairo:wght@400;700;900&display=swap');
          body {
            margin: 0; padding: 0; background: #fff;
            display: flex; justify-content: center; align-items: center;
            height: 100vh;
            font-family: 'Cairo', sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .certificate {
            width: 1000px; height: 700px;
            position: relative;
            background: linear-gradient(135deg, #f8f9fa 0%, #e2e8f0 100%);
            border: 15px solid #231545;
            outline: 5px solid #d4af37;
            outline-offset: -25px;
            box-shadow: inset 0 0 0 10px #fff;
            padding: 50px; text-align: center;
            display: flex; flex-direction: column; justify-content: center;
            box-sizing: border-box;
          }
          .corner-tl, .corner-tr, .corner-bl, .corner-br {
            position: absolute; width: 100px; height: 100px;
            border: 5px solid #d4af37;
          }
          .corner-tl { top: 25px; left: 25px; border-right: none; border-bottom: none; }
          .corner-tr { top: 25px; right: 25px; border-left: none; border-bottom: none; }
          .corner-bl { bottom: 25px; left: 25px; border-right: none; border-top: none; }
          .corner-br { bottom: 25px; right: 25px; border-left: none; border-top: none; }
          
          .ribbon {
            width: 100px; height: 100px; margin: 0 auto 20px;
            background: #d4af37; border-radius: 50%;
            display: flex; justify-content: center; align-items: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            color: #231545; font-size: 40px;
          }
          .title { font-family: 'Aref Ruqaa', serif; font-size: 60px; color: #231545; margin: 0 0 30px; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
          .subtitle { font-size: 24px; color: #4b5563; margin-bottom: 20px; }
          .student-name { font-size: 48px; font-weight: 900; color: #111827; margin: 10px 0 30px; border-bottom: 2px dashed #d4af37; display: inline-block; padding: 0 40px; }
          .details { font-size: 22px; color: #374151; line-height: 1.8; max-width: 800px; margin: 0 auto; }
          .highlight { color: #231545; font-weight: bold; }
          
          .footer { display: flex; justify-content: space-between; margin-top: 60px; padding: 0 50px; }
          .sig-box { text-align: center; }
          .sig-line { width: 200px; height: 2px; background: #111827; margin: 10px auto; }
          .sig-text { font-size: 18px; font-weight: bold; color: #4b5563; }
          
          @media print {
            @page { size: A4 landscape; margin: 0; }
            body { padding: 0; background: none; }
            .certificate { border: none; box-shadow: none; width: 100vw; height: 100vh; }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="corner-tl"></div><div class="corner-tr"></div>
          <div class="corner-bl"></div><div class="corner-br"></div>
          
          <div class="ribbon">★</div>
          <h1 class="title">شهادة تقدير وتفوق</h1>
          <div class="subtitle">يمنح هذا التكريم بكل فخر واعتزاز إلى الطالب/ة:</div>
          <div class="student-name">${student.full_name}</div>
          
          <div class="details">
            نظراً لجهوده/ا المتميزة وتفوقه/ا في <span class="highlight">امتحان ${exam.name}</span> 
            وحصوله/ا على درجة <span class="highlight">${exam.score} / ${exam.total_score}</span> (${appreciationWord}) 
            في مادة <span class="highlight">${group?.subject || 'العلوم'}</span>.
            <br/><br/>مع تمنياتنا بدوام النجاح والتوفيق.
          </div>
          
          <div class="footer">
            <div class="sig-box">
              <div class="sig-text">التاريخ</div>
              <div class="sig-line"></div>
              <div style="font-family: 'Aref Ruqaa', serif; font-size: 24px; color: #231545;">${date}</div>
            </div>
            <div class="sig-box">
              <div class="sig-text">توقيع المعلم</div>
              <div class="sig-line"></div>
              <div style="font-family: 'Aref Ruqaa', serif; font-size: 32px; color: #d4af37;">معلم المادة</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const contentDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (contentDoc) {
      contentDoc.open();
      contentDoc.write(htmlContent);
      contentDoc.close();
    }
    
    setTimeout(() => {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    }, 500);
  };
  // ----------------------------------

  useEffect(() => {
    if (!selectedStudent) return;
    
    if (studentProfileTab === 'الواجب') {
      const fetchHw = async () => {
        const { data } = await supabase.from('homework').select('*').eq('student_id', selectedStudent.id).order('date', { ascending: false });
        if (data) setHomeworkHistory(data);
      };
      fetchHw();
    } else if (studentProfileTab === 'الامتحانات') {
      const fetchExams = async () => {
        const { data } = await supabase.from('exams').select('*').eq('student_id', selectedStudent.id).order('exam_date', { ascending: false });
        if (data) setExamsHistory(data);
      };
      fetchExams();
    } else if (studentProfileTab === 'الحضور') {
      const fetchAttendance = async () => {
        const { data } = await supabase.from('attendance').select('*').eq('student_id', selectedStudent.id).order('date', { ascending: false });
        if (data) setAttendanceHistory(data);
      };
      fetchAttendance();
    } else if (studentProfileTab === 'التسميع') {
      const fetchRecitation = async () => {
        const { data } = await supabase.from('recitation').select('*').eq('student_id', selectedStudent.id).order('date', { ascending: false });
        if (data) setRecitationHistory(data);
      };
      fetchRecitation();
    }
  }, [selectedStudent, studentProfileTab]);

  const handleSaveHomework = async () => {
    if (!hwForm.date) return toast.error("يرجى تحديد التاريخ");
    setIsSubmittingHw(true);
    const { data, error } = await supabase.from('homework').insert([{
      teacher_id: teacherId,
      student_id: selectedStudent!.id,
      date: hwForm.date,
      status: hwForm.status,
      notes: hwForm.notes
    }]).select();
    setIsSubmittingHw(false);
    if (error) toast.error("حدث خطأ");
    else {
      toast.success("تم الحفظ");
      if (data) setHomeworkHistory(prev => [data[0], ...prev]);
      setHwForm({ date: '', status: 'كتب الواجب', notes: '' });
    }
  };

  const handleSaveExam = async () => {
    if (!examForm.name || !examForm.date || !examForm.score) return toast.error("يرجى ملء الحقول الأساسية");
    setIsSubmittingExam(true);
    const { data, error } = await supabase.from('exams').insert([{
      teacher_id: teacherId,
      student_id: selectedStudent!.id,
      exam_name: examForm.name,
      exam_date: examForm.date,
      score: parseFloat(examForm.score),
      total_score: parseFloat(examForm.total_score || '0'),
      notes: examForm.notes
    }]).select();
    setIsSubmittingExam(false);
    if (error) toast.error("حدث خطأ");
    else {
      toast.success("تم الحفظ");
      if (data) setExamsHistory(prev => [data[0], ...prev]);
      setExamForm({ name: '', date: '', score: '', total_score: '', notes: '' });
    }
  };

  const handleSavePayment = async (statusOverride?: string) => {
    if (!paymentForm.month || !paymentForm.date) return toast.error("يرجى تحديد الشهر والتاريخ");
    if (!selectedStudent) return toast.error("لم يتم تحديد طالب");

    setIsSubmittingPayment(true);
    const statusToSave = statusOverride || paymentForm.status;
    
    const studentGroup = groups.find(g => g.id === selectedStudent.group_id);
    let amountToSave = 0;
    
    if (statusToSave === 'مدفوع') {
      amountToSave = studentGroup?.price ? Number(studentGroup.price) : 0;
    }

    // Strictly match the Supabase table columns
    const payload = {
      student_id: selectedStudent.id,
      month: paymentForm.month,
      amount: amountToSave,
      payment_date: paymentForm.date,
      status: statusToSave
    };

    console.log("🚀 Sending Payment Payload to Supabase:", JSON.stringify(payload, null, 2));

    const { data, error } = await supabase.from('payments').insert([{ ...payload, teacher_id: teacherId }]).select();
    setIsSubmittingPayment(false);
    
    if (error) {
      console.error("❌ Payment Insert Error:", error);
      console.error("Failed Payload:", payload);
      toast.error(`حدث خطأ أثناء الحفظ: ${error.message || ''}`);
    } else {
      toast.success("تم الحفظ بنجاح");
      if (data && data.length > 0) {
        setPayments(prev => [data[0], ...prev]);
      }
      const today = new Date();
      setPaymentForm({ 
        month: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`, 
        date: today.toISOString().split('T')[0], 
        status: 'مدفوع' 
      });
    }
  };

  const handleSaveAttendance = async () => {
    if (!attendanceForm.date) return toast.error("يرجى تحديد التاريخ");
    setIsSubmittingAttendance(true);
    const { data, error } = await supabase.from('attendance').insert([{
      teacher_id: teacherId,
      student_id: selectedStudent!.id,
      date: attendanceForm.date,
      status: attendanceForm.status,
      notes: attendanceForm.notes
    }]).select();
    setIsSubmittingAttendance(false);
    if (error) toast.error("حدث خطأ");
    else {
      toast.success("تم الحفظ");
      if (data) setAttendanceHistory(prev => [data[0], ...prev]);
      setAttendanceForm({ date: '', status: 'حاضر', notes: '' });
    }
  };

  const handleSaveRecitation = async () => {
    if (!recitationForm.date || !recitationForm.grade) return toast.error("يرجى ملء الحقول");
    setIsSubmittingRecitation(true);
    const { data, error } = await supabase.from('recitation').insert([{
      teacher_id: teacherId,
      student_id: selectedStudent!.id,
      date: recitationForm.date,
      grade: recitationForm.grade,
      notes: recitationForm.notes
    }]).select();
    setIsSubmittingRecitation(false);
    if (error) toast.error("حدث خطأ");
    else {
      toast.success("تم الحفظ");
      if (data) setRecitationHistory(prev => [data[0], ...prev]);
      setRecitationForm({ date: '', grade: 'ممتاز', notes: '' });
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الطالب؟")) return;
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) toast.error("حدث خطأ أثناء الحذف");
    else {
      toast.success("تم حذف الطالب");
      setStudents(students.filter(s => s.id !== id));
      setOpenDropdownId(null);
    }
  };

  const handleGenerateMonthlyReport = async (student: Student) => {
    try {
      const monthStr = window.prompt("أدخل الشهر للتقرير (مثال: 2026-08)", new Date().toISOString().slice(0, 7));
      if (!monthStr) return;
      
      const startOfMonth = `${monthStr}-01`;
      const endOfMonth = `${monthStr}-31`; 
      const toastId = toast.loading("جاري تجميع بيانات التقرير...");

      const group = groups.find(g => g.id === student.group_id);
      const phone = student.parent_phone?.replace(/^0/, '20') || student.student_phone?.replace(/^0/, '20');
      
      if (!phone) {
        toast.error("لا يوجد رقم هاتف صالح لإرسال التقرير", { id: toastId });
        return;
      }

      const [attRes, examsRes, paymentsRes] = await Promise.all([
        supabase.from('attendance').select('*').eq('student_id', student.id).gte('date', startOfMonth).lte('date', endOfMonth),
        supabase.from('exams').select('*').eq('student_id', student.id).gte('exam_date', startOfMonth).lte('exam_date', endOfMonth),
        supabase.from('payments').select('*').eq('student_id', student.id).gte('payment_date', startOfMonth).lte('payment_date', endOfMonth)
      ]);

      const attendance = attRes.data || [];
      const exams = examsRes.data || [];
      const payments = paymentsRes.data || [];

      const totalSessions = attendance.length;
      const attended = attendance.filter(a => a.status === 'حاضر').length;
      const absent = attendance.filter(a => a.status === 'غائب').length;

      const examsSummary = exams.length > 0 
        ? exams.map(e => `🔹 ${e.exam_name || 'امتحان'}: ${e.score} / ${e.max_score}`).join('\n')
        : 'لا يوجد امتحانات مسجلة.';

      const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const monthlyFee = group?.price || 0;
      const remaining = Math.max(0, monthlyFee - totalPaid);

      const reportText = `*التقرير الشهري للطالب:* ${student.full_name} 🎓\n*المجموعة:* ${group?.name || 'غير محدد'}\n*الشهر:* ${monthStr}\n\n*📊 ملخص الحضور:*\n- إجمالي الحصص: ${totalSessions}\n- حضور: ${attended}\n- غياب: ${absent}\n\n*📝 نتائج الامتحانات:*\n${examsSummary}\n\n*💰 السجل المالي:*\n- إجمالي المدفوعات: ${totalPaid} ج.م\n${remaining > 0 ? `- المتبقي: ${remaining} ج.م` : '- تم سداد المصروفات بالكامل ✅'}\n\nمع تحيات،\nإدارة السنتر 🌟`;

      const encodedText = encodeURIComponent(reportText);
      const waLink = `https://wa.me/${phone}?text=${encodedText}`;
      
      toast.success("تم تجهيز التقرير!", { id: toastId });
      window.open(waLink, '_blank');
      setOpenDropdownId(null);
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء إنشاء التقرير");
    }
  };

  const handleWhatsAppReport = async (student: Student) => {
    try {
      const group = groups.find(g => g.id === student.group_id);
      const phone = student.parent_phone?.replace(/^0/, '20') || student.student_phone?.replace(/^0/, '20');
      if (!phone) return toast.error("لا يوجد رقم هاتف مسجل");

      // Fetch the latest status for attendance, homework, and recitation
      const [attRes, hwRes, recRes] = await Promise.all([
        supabase.from('attendance').select('status').eq('student_id', student.id).order('date', { ascending: false }).limit(1),
        supabase.from('homework').select('status').eq('student_id', student.id).order('date', { ascending: false }).limit(1),
        supabase.from('recitation').select('grade').eq('student_id', student.id).order('date', { ascending: false }).limit(1)
      ]);

      const attStatus = attRes.data?.[0]?.status || 'غير مسجل';
      const hwStatus = hwRes.data?.[0]?.status || 'غير مسجل';
      const recGrade = recRes.data?.[0]?.grade || 'غير مسجل';

      const message = `✨ تقرير الحضور والواجب والتسميع ✨\nالسلام عليكم ورحمة الله وبركاته 🌺\n👤 الطالب: ${student.full_name}\n📚 المجموعة: ${group?.name || 'غير محدد'}\n📖 المادة: ${group?.subject || 'غير محدد'}\n📌 آخر متابعة:\n▪️ الحضور: ${attStatus}\n▪️ الواجب: ${hwStatus}\n▪️ التسميع: ${recGrade}\nمع تمنياتنا بالتوفيق والنجاح 🌸\n👨‍🏫 المعلم: إدارة المنصة`;

      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
      setOpenDropdownId(null);
    } catch (err) {
      toast.error("حدث خطأ أثناء جلب بيانات التقرير");
    }
  };

  const handleExamWhatsAppReport = (exam: any) => {
    if (!selectedStudent) return;
    const group = groups.find(g => g.id === selectedStudent.group_id);
    const phone = selectedStudent.parent_phone?.replace(/^0/, '20') || selectedStudent.student_phone?.replace(/^0/, '20');
    if (!phone) return toast.error("لا يوجد رقم هاتف مسجل");
    
    const percentage = exam.total_score ? Math.round((exam.score / exam.total_score) * 100) : 0;
    const notesStr = exam.notes ? `\n✏️ ملاحظات: ${exam.notes}` : '';

    const message = `📝 تقرير نتيجة امتحان\nالسلام عليكم ورحمة الله وبركاته 🌺\nالسيد ولي أمر الطالب/ة المحترم،\nتم تسجيل نتيجة امتحان الطالب/ة ${selectedStudent.full_name} بنجاح.\n📚 المجموعة: ${group?.name || 'غير محدد'}\n📖 المادة: ${group?.subject || 'غير محدد'}\n📋 اسم الامتحان: ${exam.exam_name}\n🎯 الدرجة: ${exam.score} من ${exam.total_score || 0}\n📊 النسبة: ${percentage}%\n📅 التاريخ: ${exam.exam_date}${notesStr}\nنتمنى للطالب/ة مزيدًا من التفوق والنجاح 🌟\n👨‍🏫 المعلم: إدارة المنصة\n📱 للتواصل: ${selectedStudent.parent_phone || 'غير مسجل'}`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleEditStudentSave = async () => {
    if (!editStudentForm || !editStudentForm.full_name) return toast.error("يرجى كتابة اسم الطالب");
    setIsSubmittingEditStudent(true);
    const { data, error } = await supabase.from('students').update({
      full_name: editStudentForm.full_name,
      group_id: editStudentForm.group_id,
      student_phone: editStudentForm.student_phone,
      parent_phone: editStudentForm.parent_phone
    }).eq('id', editStudentForm.id).select();
    setIsSubmittingEditStudent(false);
    if (error) toast.error("حدث خطأ");
    else {
      toast.success("تم التعديل بنجاح");
      if (data) {
        setStudents(students.map(s => s.id === data[0].id ? data[0] : s));
      }
      setIsEditStudentModalOpen(false);
    }
  };

  const [newGroup, setNewGroup] = useState({ name: '', subject: '', type: 'center', price: '', whatsapp_link: '' });
  const [newGroupSchedules, setNewGroupSchedules] = useState<{day: string, time: string}[]>([]);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setNewGroup({
      name: group.name,
      subject: group.subject,
      type: group.type,
      price: group.price.toString(),
      whatsapp_link: group.whatsapp_link || ''
    });
    setNewGroupSchedules(group.schedules || []);
    setIsGroupModalOpen(true);
  };

  const handleDeleteGroup = async (id: string) => {
    const studentsInGroup = students.filter(s => s.group_id === id);
    if (studentsInGroup.length > 0) {
      toast.error("لا يمكن حذف المجموعة لوجود طلاب مسجلين بها. قم بنقل الطلاب أولاً.");
      return;
    }
    if (!window.confirm("هل أنت متأكد من حذف هذه المجموعة؟")) return;
    
    const { error } = await supabase.from('groups').delete().eq('id', id);
    if (error) {
      console.error("Delete Error:", error);
      toast.error("حدث خطأ أثناء الحذف");
    } else {
      toast.success("تم الحذف بنجاح");
      setGroups(prev => prev.filter(g => g.id !== id));
      if (selectedGroupView?.id === id) setSelectedGroupView(null);
    }
  };
  const handleDownloadGroupReport = async (group: Group) => {
    const groupStudents = students.filter(s => s.group_id === group.id);
    if (groupStudents.length === 0) {
      toast.error("لا يوجد طلاب في هذه المجموعة");
      return;
    }

    const toastId = toast.loading("جاري جلب البيانات وإعداد التقرير...");

    try {
      const studentIds = groupStudents.map(s => s.id);
      const { data: attData, error } = await supabase
        .from('attendance')
        .select('student_id, date, status')
        .in('student_id', studentIds)
        .order('date', { ascending: true });

      if (error) throw error;

      const uniqueDatesSet = new Set<string>();
      const attendanceMap: Record<string, Record<string, string>> = {};

      if (attData) {
        attData.forEach(att => {
          uniqueDatesSet.add(att.date);
          if (!attendanceMap[att.student_id]) attendanceMap[att.student_id] = {};
          attendanceMap[att.student_id][att.date] = att.status;
        });
      }

      let uniqueDates = Array.from(uniqueDatesSet).sort();
      if (uniqueDates.length === 0) {
        // Fallback for empty attendance
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        uniqueDates = [`${yyyy}-${mm}-${dd}`];
      }

      const formattedDates = uniqueDates.map(d => {
        const dateObj = new Date(d);
        return `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`;
      });

      let rowsHtml = '';
      groupStudents.forEach((st, idx) => {
        let colsHtml = '';
        uniqueDates.forEach(date => {
          const status = attendanceMap[st.id]?.[date];
          let cellHtml = '<span style="color: gray;">—</span>';
          if (status === 'حاضر' || status === 'متأخر') {
            cellHtml = '<span style="color: #10b981; font-weight: bold;">✓</span>';
          } else if (status === 'غائب') {
            cellHtml = '<span style="color: #ef4444; font-weight: bold;">✗</span>';
          }
          colsHtml += `<td style="border: 1px solid #ddd; padding: 12px 8px; text-align: center; font-family: monospace;">${cellHtml}</td>`;
        });
        
        rowsHtml += `
          <tr style="background-color: ${idx % 2 === 0 ? '#f9fafb' : '#ffffff'};">
            <td style="border: 1px solid #ddd; padding: 12px 8px; text-align: center; font-weight: bold; color: #4b5563;">${idx + 1}</td>
            <td style="border: 1px solid #ddd; padding: 12px 16px; font-weight: 600; color: #111827;">${st.full_name}</td>
            ${colsHtml}
          </tr>
        `;
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <title>كشف حضور - ${group.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
            body {
              font-family: 'Cairo', sans-serif;
              margin: 0;
              padding: 20px;
              color: #111827;
              background: #fff;
            }
            .header-banner {
              background-color: #231545;
              color: white;
              padding: 30px;
              border-radius: 12px;
              margin-bottom: 30px;
              position: relative;
              overflow: hidden;
            }
            .header-label {
              position: absolute;
              top: 20px;
              left: 30px;
              background: rgba(255,255,255,0.1);
              padding: 6px 12px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
            }
            .header-title {
              font-size: 32px;
              font-weight: 800;
              margin: 0 0 10px 0;
            }
            .header-subtitle {
              font-size: 16px;
              color: #cbd5e1;
              display: flex;
              gap: 15px;
              align-items: center;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background-color: #f3f4f6;
              color: #374151;
              font-weight: 700;
              padding: 14px 8px;
              border: 1px solid #ddd;
              text-align: center;
            }
            th:nth-child(2) {
              text-align: right;
              padding-right: 16px;
            }
            .footer-legend {
              display: flex;
              gap: 20px;
              padding: 15px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              margin-bottom: 20px;
              justify-content: center;
              font-weight: 600;
              font-size: 14px;
            }
            .footer-text {
              text-align: center;
              color: #64748b;
              font-size: 13px;
            }
            @media print {
              body { padding: 0; }
              .header-banner { border-radius: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              .header-label { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              th, td, tr, .footer-legend { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              @page { margin: 1cm; size: landscape; }
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div class="header-label">تقرير شهري للمجموعات</div>
            <h1 class="header-title">كشف حضور ${group.name}</h1>
            <div class="header-subtitle">
              <span>${group.subject || 'غير محدد'}</span>
              <span>•</span>
              <span>${groupStudents.length} طالب</span>
              <span>•</span>
              <span>${uniqueDates.length} أيام مسجلة</span>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th style="width: 250px;">اسم الطالب</th>
                ${formattedDates.map(d => `<th>${d}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer-legend">
            <span><span style="color: #10b981; font-weight: bold; margin-left: 5px;">✓</span> حاضر / متأخر</span>
            <span><span style="color: #ef4444; font-weight: bold; margin-left: 5px;">✗</span> غائب</span>
            <span><span style="color: gray; font-weight: bold; margin-left: 5px;">—</span> لم يُسجل</span>
          </div>
          
          <div class="footer-text">
            معلمي - تقرير حضور جاهز للطباعة
          </div>
        </body>
        </html>
      `;
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      const contentDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (contentDoc) {
        contentDoc.open();
        contentDoc.write(htmlContent);
        contentDoc.close();
      }
      
      setTimeout(() => {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 2000);
      }, 500);
      
      toast.success("تم إعداد التقرير بنجاح", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء إعداد التقرير", { id: toastId });
    }
  };

  const handlePrintSchedule = () => {
    const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    
    const scheduleByDay: Record<string, any[]> = {};
    days.forEach(day => scheduleByDay[day] = []);
    
    groups.forEach(group => {
      if (group.schedules && group.schedules.length > 0) {
        group.schedules.forEach(sch => {
          if (scheduleByDay[sch.day]) {
            scheduleByDay[sch.day].push({
              group,
              timeStr: sch.time,
              time: formatTime12h(sch.time)
            });
          }
        });
      }
    });

    let daysHtml = '';
    days.forEach(day => {
      if (scheduleByDay[day].length > 0) {
        // Sort by time
        scheduleByDay[day].sort((a, b) => a.timeStr.localeCompare(b.timeStr));
        
        let cardsHtml = '';
        scheduleByDay[day].forEach(item => {
          cardsHtml += `
            <div class="schedule-card">
              <div class="schedule-time">${item.time}</div>
              <div class="schedule-title">${item.group.name}</div>
              <div class="schedule-details">${item.group.subject || 'بدون مادة'} • ${item.group.type === 'center' ? 'سنتر' : item.group.type === 'online' ? 'أونلاين' : 'برايفت'}</div>
            </div>
          `;
        });
        
        daysHtml += `
          <div class="day-section">
            <div class="day-title">${day}</div>
            <div class="cards-grid">
              ${cardsHtml}
            </div>
          </div>
        `;
      }
    });

    if (!daysHtml) {
      toast.error("لا يوجد جداول للطباعة");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>الجدول الأسبوعي الكامل</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
          body {
            font-family: 'Cairo', sans-serif;
            margin: 0;
            padding: 30px;
            color: #111827;
            background: #fff;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
          }
          .header h1 { margin: 0; font-size: 28px; color: #1f2937; }
          .header p { margin: 5px 0 0; color: #6b7280; font-size: 16px; }
          .day-section {
            margin-bottom: 30px;
          }
          .day-title {
            font-size: 20px;
            font-weight: 800;
            color: #4f46e5;
            margin-bottom: 15px;
            padding: 5px 15px;
            background: #e0e7ff;
            border-radius: 8px;
            display: inline-block;
          }
          .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 15px;
          }
          .schedule-card {
            border: 1px solid #d1d5db;
            border-radius: 12px;
            padding: 15px;
            background: #f9fafb;
          }
          .schedule-time {
            font-weight: 800;
            color: #111827;
            font-size: 16px;
            margin-bottom: 5px;
          }
          .schedule-title {
            font-weight: 700;
            color: #374151;
            font-size: 14px;
            margin-bottom: 5px;
          }
          .schedule-details {
            font-size: 12px;
            color: #6b7280;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
          @media print {
            body { padding: 0; }
            .day-title { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .schedule-card { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; break-inside: avoid; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>الجدول الأسبوعي الكامل</h1>
          <p>معلمي - منصة إدارة الدروس</p>
        </div>
        ${daysHtml}
        <div class="footer">
          طُبع بتاريخ: ${new Date().toLocaleDateString('ar-EG')}
        </div>
      </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const contentDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (contentDoc) {
      contentDoc.open();
      contentDoc.write(htmlContent);
      contentDoc.close();
    }
    
    setTimeout(() => {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    }, 500);
  };

  const handleAddGroup = async () => {
    if (!newGroup.name || !newGroup.price) {
      toast.error("يرجى ملء الحقول المطلوبة (اسم المجموعة والسعر)");
      return;
    }
    setIsSubmittingGroup(true);
    
    if (editingGroup) {
      const { data, error } = await supabase.from('groups').update({
        name: newGroup.name,
        subject: newGroup.subject || 'غير محدد',
        type: newGroup.type,
        price: parseFloat(newGroup.price.toString()),
        whatsapp_link: newGroup.whatsapp_link,
        schedules: newGroupSchedules
      }).eq('id', editingGroup.id).select();
      
      setIsSubmittingGroup(false);

      if (error) {
        console.error("Supabase Update Error (Groups):", error);
        toast.error("حدث خطأ أثناء تعديل المجموعة");
      } else {
        toast.success("تم تعديل المجموعة بنجاح");
        if (data) setGroups(prev => prev.map(g => g.id === editingGroup.id ? data[0] : g));
        setIsGroupModalOpen(false);
        setEditingGroup(null);
        setNewGroup({ name: '', subject: '', type: 'center', price: '', whatsapp_link: '' });
        setNewGroupSchedules([]);
      }
    } else {
      const { data, error } = await supabase.from('groups').insert([{
        teacher_id: teacherId,
        name: newGroup.name,
        subject: newGroup.subject || 'غير محدد',
        type: newGroup.type,
        price: parseFloat(newGroup.price.toString()),
        whatsapp_link: newGroup.whatsapp_link,
        schedules: newGroupSchedules
      }]).select();
      
      setIsSubmittingGroup(false);

      if (error) {
        console.error("Supabase Insert Error (Groups):", error);
        toast.error("حدث خطأ أثناء إضافة المجموعة");
      } else {
        toast.success("تم إضافة المجموعة بنجاح");
        if (data) setGroups(prev => [data[0], ...prev]);
        setIsGroupModalOpen(false);
        setNewGroup({ name: '', subject: '', type: 'center', price: '', whatsapp_link: '' });
        setNewGroupSchedules([]);
      }
    }
  };

  const [newStudent, setNewStudent] = useState({ full_name: '', student_phone: '', parent_phone: '', group_id: '' });
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);

  const [newPrivateStudent, setNewPrivateStudent] = useState({
    full_name: '',
    student_phone: '',
    parent_phone: '',
    subject: '',
    payment_method: 'دفع شهري',
    price: '',
    start_date: ''
  });
  const [privateSchedules, setPrivateSchedules] = useState<{day: string, time: string}[]>([]);
  const [isSubmittingPrivate, setIsSubmittingPrivate] = useState(false);

  const handleAddPrivateStudent = async () => {
    if (!newPrivateStudent.full_name || !newPrivateStudent.price) {
      toast.error("يرجى ملء الحقول المطلوبة (اسم الطالب والسعر)");
      return;
    }
    setIsSubmittingPrivate(true);
    
    // 1. Create Group
    const groupPayload = {
      name: `${newPrivateStudent.full_name} - برايفت`,
      subject: newPrivateStudent.subject || 'غير محدد',
      type: 'private_student',
      price: parseFloat(newPrivateStudent.price.toString()),
      whatsapp_link: JSON.stringify({
        payment_method: newPrivateStudent.payment_method,
        start_date: newPrivateStudent.start_date
      }),
      schedules: privateSchedules
    };
    
    const { data: groupData, error: groupError } = await supabase.from('groups').insert([{ ...groupPayload, teacher_id: teacherId }]).select();
    
    if (groupError || !groupData || groupData.length === 0) {
      console.error("Supabase Insert Error (Private Group):", groupError);
      toast.error("حدث خطأ أثناء إضافة مجموعة الطالب");
      setIsSubmittingPrivate(false);
      return;
    }
    
    const newGroup = groupData[0];
    
    // 2. Create Student
    const studentPayload = {
      full_name: newPrivateStudent.full_name,
      student_phone: newPrivateStudent.student_phone,
      parent_phone: newPrivateStudent.parent_phone,
      group_id: newGroup.id
    };
    
    const { data: studentData, error: studentError } = await supabase.from('students').insert([{ ...studentPayload, teacher_id: teacherId }]).select();
    
    setIsSubmittingPrivate(false);
    
    if (studentError) {
      console.error("Supabase Insert Error (Private Student):", studentError);
      toast.error("حدث خطأ أثناء إضافة بيانات الطالب");
      // Optional: rollback group creation if we had transaction support
    } else {
      toast.success("تم إضافة الطالب برايفت بنجاح");
      setGroups(prev => [newGroup, ...prev]);
      if (studentData) setStudents(prev => [studentData[0], ...prev]);
      setIsPrivateModalOpen(false);
      setNewPrivateStudent({ full_name: '', student_phone: '', parent_phone: '', subject: '', payment_method: 'دفع شهري', price: '', start_date: '' });
      setPrivateSchedules([]);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.full_name || !newStudent.group_id) {
      toast.error("يرجى ملء الحقول المطلوبة (الاسم والمجموعة)");
      return;
    }
    setIsSubmittingStudent(true);
    const { data, error } = await supabase.from('students').insert([{
      teacher_id: teacherId,
      full_name: newStudent.full_name,
      student_phone: newStudent.student_phone,
      parent_phone: newStudent.parent_phone,
      group_id: newStudent.group_id
    }]).select();
    setIsSubmittingStudent(false);

    if (error) {
      console.error("Supabase Insert Error (Students):", error);
      toast.error("حدث خطأ أثناء إضافة الطالب");
    } else {
      toast.success("تم إضافة الطالب بنجاح");
      if (data) setStudents(prev => [data[0], ...prev]);
      setIsAddStudentModalOpen(false);
      setNewStudent({ full_name: '', student_phone: '', parent_phone: '', group_id: '' });
    }
  };

  const navigation = [
    { name: "الرئيسية", icon: Home },
    { name: "المجموعات", icon: Users },
    { name: "الطلاب", icon: BookOpen },
    { name: "الجدول", icon: Calendar },
    ...((userRole === 'teacher' || userRole === 'super_admin') ? [{ name: "المالية", icon: DollarSign }] : []),
    ...((userRole === 'teacher' || userRole === 'super_admin') ? [{ name: "إدارة المساعدين", icon: Users }] : []),
    { name: "الملازم", icon: BookCheck },
    ...((userRole === 'teacher' || userRole === 'super_admin') ? [{ name: "باقات معلمي", icon: Crown }] : []),
  ];

  const filteredGroups = groups.filter(group => {
    if (activeGroupFilter === "الكل") return true;
    if (activeGroupFilter === "أونلاين") return group.type === "online";
    if (activeGroupFilter === "السنتر") return group.type === "center";
    if (activeGroupFilter === "م.ج برايفت") return group.type === "private_group";
    if (activeGroupFilter === "طالب برايفت") return group.type === "private_student";
    return true;
  });

  const getFilterCount = (filter: string) => {
    if (filter === "الكل") return groups.length;
    if (filter === "أونلاين") return groups.filter(g => g.type === "online").length;
    if (filter === "السنتر") return groups.filter(g => g.type === "center").length;
    if (filter === "م.ج برايفت") return groups.filter(g => g.type === "private_group").length;
    if (filter === "طالب برايفت") return groups.filter(g => g.type === "private_student").length;
    return 0;
  };

  if (isCheckingSession) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B1120]">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen w-full overflow-y-auto flex flex-col bg-[#0B1120] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden relative" dir="rtl">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 -translate-x-1/3"></div>

        {/* 1. Header */}
        <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0B1120]/80 border-b border-white/10">
          <div className="container mx-auto px-4 h-20 flex items-center justify-between">
            {/* Logo & Identity (Right) */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20"><GraduationCap className="h-6 w-6 text-white" /></div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent hidden sm:block">منصة معلمي</h1>
            </div>

            {/* Developer Identity Card (Center/Left) */}
            <div className="hidden lg:flex items-center gap-3 bg-white/5 pr-4 pl-2 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight text-right">يوسف عبد اللطيف (Jo)</span>
                <span className="text-[10px] text-gray-400 leading-tight text-right">تطوير وبرمجة | Founder & Developer</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-[0_0_15px_rgba(99,102,241,0.5)] flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-[#0B1120] rounded-full flex items-center justify-center overflow-hidden">
                  <User className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
            </div>

            {/* Quick Actions (Left) */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { setAuthMode('signin'); setIsAuthModalOpen(true); }}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-3 py-2"
              >
                تسجيل الدخول
              </button>
              <button 
                onClick={() => { setAuthMode('signup'); setSignupRole('teacher'); setIsAuthModalOpen(true); }}
                className="text-sm font-bold bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 hidden sm:block"
              >
                إنشاء حساب معلم
              </button>
            </div>
          </div>
        </header>

        {/* 2. Hero Section */}
        <section className="relative pt-24 pb-32 text-center container mx-auto px-4 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            ✨ منصة سحابية متكاملة لإدارة المراكز التعليمية والمدرسين
          </div>
          
          <h2 className="text-4xl sm:text-6xl font-extrabold text-white mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 max-w-4xl mx-auto">
            أدر سنترك بذكاء.. <br/> وسهّل حياتك وحياة طلابك
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            نظام سحابي متطور متابعة الحضور والغياب، إدارة المساعدين، التقارير الشهيرة عبر الواتساب، السجل المالي، وتوليد شهادات التقدير تلقائياً.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-700 delay-300">
            <button 
              onClick={() => { setAuthMode('signup'); setSignupRole('teacher'); setIsAuthModalOpen(true); }}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] hover:-translate-y-1 text-lg flex items-center justify-center gap-2 flex-col sm:flex-row"
            >
              تجربة المنصة مجاناً
              <span className="text-sm font-normal opacity-80 block">(إنشاء حساب معلم)</span>
            </button>
            <button 
              onClick={() => { setAuthMode('signin'); setIsAuthModalOpen(true); }}
              className="w-full sm:w-auto px-8 py-4 bg-[#111827] border border-gray-700 hover:bg-white/5 text-white font-bold rounded-2xl transition-all text-lg flex items-center justify-center"
            >
              تسجيل الدخول
            </button>
          </div>
        </section>

        {/* 3. Key Features Grid */}
        <section className="py-24 bg-[#111827] border-y border-white/5 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-white mb-4">كل ما تحتاجه في مكان واحد</h3>
              <p className="text-gray-400">مميزات صممت خصيصاً لتوفير وقتك وجهدك</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Users, title: "إدارة المجموعات والطلاب", desc: "تسجيل البيانات، طباعة كروت الطالب، ومتابعة غياب وحضور الحصص بدقة." },
                { icon: ShieldCheck, title: "نظام المساعدين المعتمد", desc: "إضافة مساعدين برقم الهاتف مع حجب الصلاحيات والبيانات المالية." },
                { icon: MessageSquare, title: "تقارير الواتساب الفورية", desc: "إرسال تقارير الحضور والغياب ودرجات الاختبارات لولي الأمر بنقرة واحدة." },
                { icon: DollarSign, title: "المتابعة المالية والملازم", desc: "تسليم الملازم، تحصيل المصاريف الشهرية، وتقارير الإيرادات المتأخرة." },
                { icon: Award, title: "شهادات التقدير بذكاء", desc: "تصميم وتوليد شهادات تقدير وتفوق للطلاب الأوائل تلقائياً." },
                { icon: Smartphone, title: "تطبيق ويب سريع (PWA)", desc: "إمكانية تثبيت المنصة على الهاتف أو الكمبيوتر والعمل بسلاسة وسرعة فائقة." }
              ].map((feat, i) => (
                <div key={i} className="p-6 rounded-3xl bg-[#0B1120] border border-gray-800 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] transition-all group text-right">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feat.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">{feat.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. How It Works */}
        <section className="py-24 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-white mb-4">كيف تبدأ؟</h3>
              <p className="text-gray-400">ثلاث خطوات بسيطة للانطلاق</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { step: "1️⃣", title: "أنشئ حسابك", desc: "سجل كمعلم في أقل من دقيقة باستخدام رقم هاتفك فقط." },
                { step: "2️⃣", title: "أضف مجموعاتك ومساعديك", desc: "قم بضبط جداولك وإضافة أرقام مساعديك المصرح لهم." },
                { step: "3️⃣", title: "انطلق وأدر سنترك", desc: "تابع الحضور والمالية وأرسل تقارير الواتساب بضغطة زر." }
              ].map((item, i) => (
                <div key={i} className="text-center relative">
                  {i !== 2 && <div className="hidden md:block absolute top-1/4 -left-1/2 w-full h-[2px] bg-gradient-to-l from-indigo-500/50 to-transparent z-0"></div>}
                  <div className="w-20 h-20 mx-auto rounded-full bg-[#111827] border-4 border-[#0B1120] shadow-[0_0_20px_rgba(79,70,229,0.2)] flex items-center justify-center text-3xl relative z-10 mb-6">
                    {item.step}
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Footer */}
        <footer className="bg-[#111827] border-t border-white/10 py-12 relative z-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-right">
              <div>
                <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20"><GraduationCap className="h-5 w-5 text-white" /></div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">منصة معلمي</h1>
                </div>
                <p className="text-gray-400 text-sm">جميع الحقوق محفوظة © 2026 - منصة معلمي.</p>
                <p className="text-gray-500 text-xs mt-2">تم التطوير بشغف بواسطة <span className="text-indigo-400 font-sans" dir="ltr">Eng. Youssef Abdellatif Jo</span>.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a href="https://wa.me/201040971231" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors border border-[#25D366]/20 font-bold text-sm">
                  <MessageSquare className="w-4 h-4" /> واتساب الدعم
                </a>
                <a href="tel:+201040971231" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors border border-indigo-500/20 font-bold text-sm">
                  <Phone className="w-4 h-4" /> تواصل معنا
                </a>
              </div>
            </div>
          </div>
        </footer>

        {/* Auth Modal Overlay */}
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAuthModalOpen(false)}></div>
            <div className="w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200">
              <button 
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute -top-12 left-0 sm:-right-12 sm:left-auto text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="bg-[#111827] rounded-3xl border border-white/10 p-8 shadow-2xl">
                <div className="flex justify-center mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20"><GraduationCap className="h-8 w-8 text-white" /></div>
                </div>
                
                <div className="flex p-1 bg-[#0B1120] rounded-xl mb-6 border border-gray-800">
                  <button
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMode === 'signin' ? 'bg-[#1f2937] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => { setAuthMode('signin'); setLoginError(""); }}
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMode === 'signup' ? 'bg-[#1f2937] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => { setAuthMode('signup'); setLoginError(""); }}
                  >
                    إنشاء حساب
                  </button>
                </div>

                {authMode === 'signin' ? (
                  <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="text-center mb-4">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">مرحباً بعودتك</h2>
                      <p className="text-gray-400 text-sm mt-1">قم بتسجيل الدخول للوصول إلى حسابك</p>
                    </div>

                    {loginError && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl text-center">
                        {loginError}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 block text-right">رقم الهاتف</label>
                      <div className="relative">
                        <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                          type="tel"
                          required
                          dir="ltr"
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          className="w-full rounded-xl border border-gray-800 bg-[#0B1120] py-3 pr-12 pl-4 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-left font-mono"
                          placeholder="01xxxxxxxxx"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 block text-right">كلمة المرور</label>
                      <div className="relative">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                          type="password"
                          required
                          dir="ltr"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full rounded-xl border border-gray-800 bg-[#0B1120] py-3 pr-12 pl-4 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-left"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-bold hover:bg-indigo-700 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] mt-6 disabled:opacity-50 flex justify-center items-center h-12"
                    >
                      {isLoggingIn ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div> : 'دخول'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="text-center mb-4">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">إنشاء حساب</h2>
                      <p className="text-gray-400 text-sm mt-1">انضم إلينا لإدارة دروسك وطلابك باحترافية</p>
                    </div>

                    {loginError && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl text-center">
                        {loginError}
                      </div>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      <label className="text-sm font-medium text-gray-300 block text-right">التسجيل كـ</label>
                      <div className="flex p-1 bg-[#0B1120] rounded-xl border border-gray-800">
                        <button
                          type="button"
                          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${signupRole === 'teacher' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                          onClick={() => setSignupRole('teacher')}
                        >
                          <User className="w-4 h-4" /> معلم
                        </button>
                        <button
                          type="button"
                          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${signupRole === 'assistant' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                          onClick={() => setSignupRole('assistant')}
                        >
                          <Users className="w-4 h-4" /> مساعد
                        </button>
                      </div>
                    </div>

                    {signupRole === 'teacher' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                          <label className="text-sm font-medium text-gray-300 block text-right">الاسم بالكامل</label>
                          <div className="relative">
                            <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <input
                              type="text"
                              required={signupRole === 'teacher'}
                              value={signupName}
                              onChange={(e) => setSignupName(e.target.value)}
                              className="w-full rounded-xl border border-gray-800 bg-[#0B1120] py-2.5 pr-10 pl-3 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-right"
                              placeholder="أحمد محمد"
                            />
                          </div>
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                          <label className="text-sm font-medium text-gray-300 block text-right">المادة الدراسية</label>
                          <div className="relative">
                            <BookOpen className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <input
                              type="text"
                              required={signupRole === 'teacher'}
                              value={signupSubject}
                              onChange={(e) => setSignupSubject(e.target.value)}
                              className="w-full rounded-xl border border-gray-800 bg-[#0B1120] py-2.5 pr-10 pl-3 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-right"
                              placeholder="الرياضيات"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 block text-right">رقم الهاتف</label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                          type="tel"
                          required
                          dir="ltr"
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value)}
                          className="w-full rounded-xl border border-gray-800 bg-[#0B1120] py-2.5 pr-10 pl-3 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-left font-mono"
                          placeholder="01xxxxxxxxx"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 block text-right">كلمة المرور</label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                          type="password"
                          required
                          dir="ltr"
                          minLength={6}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="w-full rounded-xl border border-gray-800 bg-[#0B1120] py-2.5 pr-10 pl-3 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-left"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    {signupRole === 'teacher' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 block text-right">تأكيد كلمة المرور</label>
                        <div className="relative">
                          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <input
                            type="password"
                            required={signupRole === 'teacher'}
                            dir="ltr"
                            minLength={6}
                            value={signupConfirm}
                            onChange={(e) => setSignupConfirm(e.target.value)}
                            className="w-full rounded-xl border border-gray-800 bg-[#0B1120] py-2.5 pr-10 pl-3 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-left"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full bg-indigo-600 text-white rounded-xl py-3 font-bold hover:bg-indigo-700 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] mt-2 disabled:opacity-50 flex justify-center items-center h-11"
                    >
                      {isLoggingIn ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div> : 'إنشاء حساب'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0B1120] text-white font-sans selection:bg-indigo-500/30">
      
      {/* Sidebar (Right Fixed) */}
      <aside 
        className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col justify-between border-l border-white/10 bg-[#111827] transition-transform duration-300 lg:static lg:translate-x-0 h-[100dvh] overflow-hidden p-0 lg:h-screen ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex-1 overflow-y-auto p-4 pb-4">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 mb-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20"><GraduationCap className="h-6 w-6 text-white" /></div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                منصة معلمي
              </h1>
            </div>
            <button className="lg:hidden rounded-lg p-2 hover:bg-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <nav className="space-y-1.5">
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
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm font-semibold transition-all duration-200 ${
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

            {userRole === 'super_admin' && (
              <button
                onClick={() => window.location.href = '/admin'}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm font-semibold transition-all duration-200 text-purple-400 bg-purple-500/5 hover:bg-purple-500/10 mt-4 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
              >
                <ShieldCheck className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                لوحة الإدارة
              </button>
            )}
          </nav>
        </div>

        <div className="shrink-0 p-4 border-t border-slate-800 bg-slate-900 pb-28 lg:pb-4 space-y-3">
          <div className="rounded-xl bg-gradient-to-br from-[#0B1120] to-[#111827] border border-white/5 p-4 text-center shadow-inner relative overflow-hidden hidden lg:block">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
            <p className="text-sm font-medium text-gray-300 relative z-10">إدارة يومك الدراسي بسهولة</p>
          </div>
          
          <div className="flex items-center justify-between w-full p-3 rounded-xl bg-gray-800/30 border border-gray-700/50 mb-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${(userRole === 'teacher' || userRole === 'super_admin') ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-500/20 text-orange-400'}`}>
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs text-gray-400">حساب موثق</span>
                <span className="text-sm font-bold text-white">{userRole === 'super_admin' ? 'مدير النظام' : userRole === 'teacher' ? 'المعلم' : 'المساعد'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" /> تسجيل الخروج
          </button>
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

          <div className="flex items-center gap-3 sm:gap-5 relative">
            <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={handleImportData} />
            
            {userRole === 'super_admin' && (
              <button 
                onClick={() => window.location.href = '/admin'} 
                className="hidden sm:flex items-center gap-2 rounded-xl bg-purple-500/10 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm font-bold text-purple-400 transition-all hover:bg-purple-500/20 hover:text-purple-300 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
              >
                <ShieldCheck className="h-4 w-4" />
                لوحة التحكم
              </button>
            )}
            
            {isInstallable && (
              <button onClick={handleInstallPWA} className="hidden sm:flex items-center gap-2 rounded-xl bg-indigo-500/10 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm font-semibold text-indigo-300 transition-all hover:bg-indigo-500/20 hover:text-indigo-200 border border-indigo-500/20 active:scale-95">
                <Download className="h-4 w-4" />
                تثبيت التطبيق (PWA)
              </button>
            )}

            <div className="relative">
              <button onClick={() => setIsBackupMenuOpen(!isBackupMenuOpen)} className="flex items-center gap-2 rounded-xl bg-blue-500/10 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-blue-400 transition-all hover:bg-blue-500/20 hover:text-blue-300 border border-blue-500/20">
                <Cloud className="h-4 w-4" />
                <span className="hidden sm:inline">النسخ الاحتياطي</span>
              </button>
              {isBackupMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsBackupMenuOpen(false)}></div>
                  <div className="absolute left-0 mt-2 w-52 rounded-xl border border-gray-700 bg-[#1f2937] shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <button onClick={handleExportData} className="flex w-full items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                      <Download className="h-4 w-4" /> تصدير البيانات
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex w-full items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                      <Upload className="h-4 w-4" /> استيراد البيانات
                    </button>
                    <button onClick={() => { setIsClearDataModalOpen(true); setIsBackupMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-gray-700/50 mt-1 pt-2">
                      <Trash2 className="h-4 w-4" /> مسح كل البيانات
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <button className="relative rounded-xl p-2 sm:p-2.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white bg-[#0B1120] border border-white/5">
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#0B1120] animate-pulse"></span>
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <button 
              onClick={handleLogout} 
              className="flex sm:hidden items-center justify-center rounded-xl p-2 text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>

            <div className="hidden sm:block h-8 w-px bg-white/10"></div>

            <button className="flex items-center gap-3 transition-opacity hover:opacity-80 rounded-xl hover:bg-white/5 p-1.5 pr-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-white">{teacherName ? `أهلاً بك، أ. ${teacherName} 👋` : 'مرحباً، معلم'}</p>
                <p className="text-xs text-gray-400">{userRole === 'assistant' ? 'حساب المساعد' : 'المعلم المعتمد'}</p>
              </div>
              <div className="flex h-10 w-10 overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 items-center justify-center text-indigo-300">
                <User className="h-5 w-5" />
              </div>
            </button>
          </div>
        </header>

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 pb-32 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8 min-h-screen scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="mx-auto max-w-7xl space-y-8">


            {activeTab === "الرئيسية" ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Developer SaaS Banner */}
                <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/40 via-[#111827] to-[#111827] p-8 shadow-lg relative overflow-hidden flex flex-col xl:flex-row gap-8 items-start xl:items-center justify-between">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                  
                  <div className="relative z-10 flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <img 
                        src="/profile.png" 
                        alt="Youssef Abdellatif" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/50 shadow-md shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = "https://github.com/YoussefJo25.png";
                        }}
                      />
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                        <Crown className="w-4 h-4" /> تم التطوير بواسطة يوسف عبد اللطيف (Youssef Abdellatif Jo)
                      </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                      منصة سحابية متكاملة لإدارة المراكز التعليمية
                    </h2>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
                      نظام سحابي متطور لإدارة المجموعات الدراسية، متابعة الحضور والغياب، السجل المالي، الملازم، وتوليد شهادات التقدير بذكاء لمساعدة المعلمين على تنظيم عملهم باحترافية.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <a href="https://www.linkedin.com/in/youssef-abdellatif-ai/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-gray-700 text-gray-400 hover:text-white hover:bg-[#0077b5]/20 hover:border-[#0077b5]/50 transition-all">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                      </a>
                      <a href="https://github.com/YoussefJo25" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 hover:border-gray-600 transition-all">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                      </a>
                      <a href="https://www.facebook.com/share/1D8UuQ5xy2/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-gray-700 text-gray-400 hover:text-white hover:bg-[#1877F2]/20 hover:border-[#1877F2]/50 transition-all">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                      </a>
                    </div>
                  </div>

                  <div className="relative z-10 flex flex-col sm:flex-row xl:flex-col gap-3 w-full xl:w-auto shrink-0">
                    <a href="https://wa.me/201040971231" target="_blank" rel="noopener noreferrer" className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20 transition-all font-bold text-sm">
                      <MessageSquare className="w-4 h-4" /> واتساب الدعم والتفعيل
                    </a>
                    <a href="tel:01040971231" className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all font-bold text-sm">
                      <Phone className="w-4 h-4" /> التواصل الهاتفي
                    </a>
                    <button className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-indigo-600 border border-indigo-500 text-white hover:bg-indigo-700 transition-all font-bold text-sm shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                      <Star className="w-4 h-4" /> طلب اشتراك جديد
                    </button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Card 1: Students */}
                  <div className="rounded-2xl border border-gray-800 bg-[#111827] p-3 sm:p-4 shadow-sm transition-all hover:border-gray-700 hover:shadow-lg hover:shadow-green-500/5 flex flex-col items-center justify-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="text-center">
                      <p className="text-xl sm:text-2xl font-bold text-white">{isLoadingStudents ? "..." : students.length}</p>
                      <p className="text-[10px] sm:text-xs font-medium text-gray-400 mt-0.5">الطلاب</p>
                    </div>
                  </div>
                  
                  {/* Card 2: Today's Classes */}
                  <div className="rounded-2xl border border-gray-800 bg-[#111827] p-3 sm:p-4 shadow-sm transition-all hover:border-gray-700 hover:shadow-lg hover:shadow-blue-500/5 flex flex-col items-center justify-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <div className="text-center">
                      <p className="text-xl sm:text-2xl font-bold text-white">0</p>
                      <p className="text-[10px] sm:text-xs font-medium text-gray-400 mt-0.5">حصص اليوم</p>
                    </div>
                  </div>

                  {/* Card 3: Groups */}
                  <div className="rounded-2xl border border-gray-800 bg-[#111827] p-3 sm:p-4 shadow-sm transition-all hover:border-gray-700 hover:shadow-lg hover:shadow-orange-500/5 flex flex-col items-center justify-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400">
                      <Library className="h-4 w-4" />
                    </div>
                    <div className="text-center">
                      <p className="text-xl sm:text-2xl font-bold text-white">{isLoadingGroups ? "..." : groups.length}</p>
                      <p className="text-[10px] sm:text-xs font-medium text-gray-400 mt-0.5">المجموعات</p>
                    </div>
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
                {selectedGroupView ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <button onClick={() => setSelectedGroupView(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                      العودة للمجموعات
                    </button>
                    
                    <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 gap-4">
                        <div>
                          <h2 className="text-2xl font-bold text-white">{selectedGroupView.name}</h2>
                          <p className="text-gray-400 mt-1">{selectedGroupView.subject} • {selectedGroupView.type === 'center' ? 'سنتر' : selectedGroupView.type === 'online' ? 'أونلاين' : 'برايفت'}</p>
                        </div>
                        <div className="text-left">
                          <p className="text-xl font-bold text-indigo-400">{selectedGroupView.price} <span className="text-sm text-gray-500">ج.م / الشهر</span></p>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="flex flex-wrap gap-2">
                          {selectedGroupView.schedules?.map((sch: any, i: number) => (
                            <span key={i} className="bg-[#0B1120] text-sm px-3 py-1.5 rounded-lg border border-gray-800 text-gray-300 flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-indigo-400" />
                              {sch.day} {formatTime12h(sch.time)}
                            </span>
                          ))}
                        </div>
                        
                        <button 
                          onClick={() => { setNewStudent({...newStudent, group_id: selectedGroupView.id}); setIsAddStudentModalOpen(true); }}
                          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm font-semibold text-white transition-all hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 w-full sm:w-auto"
                        >
                          <Plus className="h-4 w-4" />
                          إضافة طالب للمجموعة
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-8 mb-4 border-b border-gray-800 pb-2">
                      <h3 className="text-lg font-bold text-white">طلاب المجموعة ({students.filter(s => s.group_id === selectedGroupView.id).length})</h3>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      {students.filter(s => s.group_id === selectedGroupView.id).length === 0 ? (
                        <div className="text-center py-12 text-gray-500 border border-dashed border-gray-800 rounded-xl bg-[#111827]/50">
                          لا يوجد طلاب مسجلين في هذه المجموعة حتى الآن.
                        </div>
                      ) : (
                        students.filter(s => s.group_id === selectedGroupView.id).map(student => (
                          <div key={student.id} className="relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-800 bg-[#111827] hover:border-gray-700 hover:bg-[#1f2937] transition-all cursor-pointer group" onClick={() => setSelectedStudent(student)}>
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 text-lg font-bold text-indigo-300">
                                {student.full_name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">{student.full_name}</h4>
                                <p className="text-xs text-gray-400 mt-1">{student.student_phone || 'لا يوجد هاتف'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-4 sm:mt-0 justify-end w-full sm:w-auto">
                              <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-500/20">
                                منتظم
                              </span>
                              
                              <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => setOpenDropdownId(openDropdownId === student.id ? null : student.id)}
                                  className="p-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                  <MoreVertical className="h-5 w-5" />
                                </button>
                                
                                {openDropdownId === student.id && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)}></div>
                                    <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-48 rounded-xl border border-gray-700 bg-[#1f2937] shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                      <button onClick={() => { setEditStudentForm(student); setIsEditStudentModalOpen(true); setOpenDropdownId(null); }} className="flex w-full items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                        <Edit className="h-4 w-4" /> تعديل
                                      </button>
                                      <button onClick={() => { setStatsData({ studentName: student.full_name, totalExams: 5, avgScore: '85%' }); setIsStatsModalOpen(true); setOpenDropdownId(null); }} className="flex w-full items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                        <BarChart className="h-4 w-4" /> الإحصائيات
                                      </button>
                                      <button onClick={() => handleWhatsAppReport(student)} className="flex w-full items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm text-green-400 hover:bg-green-500/10 transition-colors border-b border-gray-700/50">
                                        <PhoneCall className="h-4 w-4" /> تقرير واتساب
                                      </button>
                                      <button onClick={() => handleGenerateMonthlyReport(student)} className="flex w-full items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm text-[#25D366] hover:bg-[#25D366]/10 transition-colors border-b border-gray-700/50">
                                        <MessageSquare className="h-4 w-4" /> التقرير الشهري 📱
                                      </button>
                                      <button onClick={() => handleDeleteStudent(student.id)} className="flex w-full items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                                        <Trash2 className="h-4 w-4" /> حذف
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => setIsGroupModalOpen(true)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm font-semibold text-white transition-all hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 flex-1 sm:flex-none"
                    >
                      <Plus className="h-4 w-4" />
                      إضافة مجموعة
                    </button>
                    <button 
                      onClick={() => setIsPrivateModalOpen(true)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#111827] border border-gray-700 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm font-semibold text-gray-300 transition-all hover:bg-white/5 active:scale-95 flex-1 sm:flex-none"
                    >
                      <Plus className="h-4 w-4" />
                      إضافة طالب برايفت
                    </button>
                  </div>
                  <button className="flex items-center justify-center gap-2 rounded-xl bg-[#111827] border border-gray-700 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm font-semibold text-gray-300 transition-all hover:bg-white/5 w-full sm:w-auto">
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
                        {filter} <span className="ml-1 text-xs opacity-60">({getFilterCount(filter)})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Groups List / Empty State */}
                {isLoadingGroups ? (
                  <div className="flex justify-center py-24">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                  </div>
                ) : groups.length === 0 ? (
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
                ) : (
                  <div className="flex flex-col gap-4 mt-8">
                    {filteredGroups.map(group => (
                      <div key={group.id} className="relative flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group" onClick={() => setSelectedGroupView(group)}>
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20">
                            <Users className="h-6 w-6 text-indigo-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{group.name}</h4>
                              <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-gray-300 border border-gray-800">
                                {students.filter(s => s.group_id === group.id).length} طالب
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {group.schedules && group.schedules.length > 0 ? (
                                group.schedules.map((sch, i) => (
                                  <span key={i} className="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded border border-white/5">
                                    {sch.day}: {formatTime12h(sch.time)}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-500 italic">لا توجد مواعيد</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-4 lg:mt-0 justify-end w-full lg:w-auto border-t lg:border-t-0 border-gray-800 pt-4 lg:pt-0">
                          <div className="flex items-center gap-4 ml-4">
                            <span className="text-base font-bold text-indigo-400">{group.price} <span className="text-xs text-gray-500">ج.م</span></span>
                            <span className="rounded-md bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400 border border-indigo-500/20">
                              {group.type === 'center' ? 'سنتر' : group.type === 'online' ? 'أونلاين' : 'برايفت'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleDownloadGroupReport(group)} className="p-2 rounded-lg text-gray-400 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors" title="تحميل تقرير المجموعة">
                              <FileDown className="h-5 w-5" />
                            </button>
                            
                            <div className="relative">
                              <button 
                                onClick={() => setOpenDropdownId(openDropdownId === group.id ? null : group.id)}
                                className="p-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                              >
                                <MoreVertical className="h-5 w-5" />
                              </button>
                              
                              {openDropdownId === group.id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)}></div>
                                  <div className="absolute left-0 mt-2 w-48 rounded-xl border border-gray-700 bg-[#1f2937] shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                    <button onClick={() => { handleEditGroup(group); setOpenDropdownId(null); }} className="flex w-full items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                      <Edit className="h-4 w-4" /> تعديل
                                    </button>
                                    <button onClick={() => { handleDeleteGroup(group.id); setOpenDropdownId(null); }} className="flex w-full items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                                      <Trash2 className="h-4 w-4" /> حذف
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                  </>
                )}
              </div>
            ) : activeTab === "الجدول" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-sm">
                  <div>
                    <h3 className="text-xl font-bold text-white">الجدول الأسبوعي الكامل</h3>
                    <p className="mt-1 text-sm text-gray-400">عرض جميع المجموعات والمواعيد بشكل احترافي قابل للطباعة</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center rounded-xl bg-[#0B1120] border border-gray-800 p-1 w-full sm:w-auto">
                      <button 
                        onClick={() => setScheduleView("احترافي")}
                        className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                          scheduleView === "احترافي" 
                            ? "bg-indigo-600 text-white shadow-md" 
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        احترافي
                      </button>
                      <button 
                        onClick={() => setScheduleView("تقليدي")}
                        className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                          scheduleView === "تقليدي" 
                            ? "bg-indigo-600 text-white shadow-md" 
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        تقليدي
                      </button>
                    </div>
                    <button onClick={handlePrintSchedule} className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/20 active:scale-95 w-full sm:w-auto">
                      <Printer className="h-4 w-4" />
                      طباعة الجدول
                    </button>
                  </div>
                </div>

                {/* Professional View (احترافي) */}
                {scheduleView === "احترافي" && (() => {
                  const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
                  const activeDays = days.filter(day => groups.some(g => g.schedules?.some(sch => sch.day === day)));

                  if (activeDays.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-800 bg-[#111827]/40 py-32 text-center">
                        <CalendarDays className="h-12 w-12 text-gray-600 mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-white">لا توجد مواعيد مسجلة حالياً</h3>
                        <p className="mt-2 text-sm text-gray-400">قم بإضافة مواعيد للمجموعات لتظهر هنا.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeDays.map(day => {
                        const dayGroups = groups.filter(g => g.schedules?.some(sch => sch.day === day));
                        
                        const sortedGroups = dayGroups.map(g => {
                          const sch = g.schedules?.find(s => s.day === day)!;
                          return { group: g, timeStr: sch.time, formattedTime: formatTime12h(sch.time) };
                        }).sort((a, b) => a.timeStr.localeCompare(b.timeStr));

                        return (
                          <div key={day} className="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-[#111827] p-5 shadow-sm">
                            <div className="flex items-center justify-between border-b-2 border-indigo-500/20 pb-3">
                              <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                <span className="text-indigo-500">•</span> {day}
                              </h4>
                              <span className="bg-[#0B1120] text-gray-400 text-xs px-2.5 py-1 rounded-md border border-gray-800 font-medium">{sortedGroups.length} مواعيد</span>
                            </div>
                            
                            <div className="flex flex-col gap-3">
                              {sortedGroups.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-[#0B1120] border border-gray-800 rounded-xl p-3.5 hover:border-indigo-500/30 hover:bg-[#1a2333] transition-all cursor-pointer group">
                                  {/* Left Badge: Time */}
                                  <div className="shrink-0 flex items-center justify-center bg-indigo-500/10 text-indigo-400 text-sm font-bold px-3 py-2 rounded-lg border border-indigo-500/20 min-w-[70px]">
                                    {item.formattedTime}
                                  </div>
                                  
                                  {/* Center/Right: Details */}
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <h5 className="text-sm font-bold text-white mb-1 truncate group-hover:text-indigo-400 transition-colors">{item.group.name}</h5>
                                    <p className="text-xs text-gray-400 truncate flex items-center gap-1.5">
                                      {item.group.subject || 'بدون مادة'} <span className="text-gray-600">•</span> {item.group.type === 'center' ? 'سنتر' : item.group.type === 'online' ? 'أونلاين' : 'برايفت'}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
                
                {/* Traditional Grid View (تقليدي) */}
                {scheduleView === "تقليدي" && (
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
                              {Array.from({ length: 24 }, (_, i) => {
                                const cellGroups = groups.filter(g => 
                                  g.schedules?.some(sch => sch.day === day && parseInt(sch.time.split(':')[0]) === i)
                                );
                                
                                return (
                                  <td key={i} className="border-l border-gray-800/50 p-2 text-center transition-colors hover:bg-white/5 cursor-crosshair">
                                    {cellGroups.length > 0 ? (
                                      <div className="flex flex-col gap-1">
                                        {cellGroups.map((g, idx) => (
                                          <div key={idx} className="bg-indigo-500/20 text-indigo-300 text-[10px] p-1.5 rounded-md border border-indigo-500/30 whitespace-nowrap overflow-hidden text-ellipsis w-20 mx-auto" title={g.name}>
                                            {g.name}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-gray-700/50 font-mono">--</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
                  <button onClick={handlePrintFinancialReport} className="flex items-center justify-center gap-2 rounded-xl bg-[#111827] border border-gray-700 px-5 py-2.5 text-sm font-semibold text-gray-300 transition-all hover:bg-white/5 active:scale-95 w-full sm:w-auto shadow-sm">
                    <FileDown className="h-4 w-4" />
                    تصدير السجل المالي PDF
                  </button>
                </div>

                {/* Master KPI Card */}
                <div className="mb-6 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6 shadow-[0_0_15px_-3px_rgba(59,130,246,0.1)] transition-all hover:border-blue-500/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-blue-400">إجمالي صافي الدخل</h4>
                      <p className="mt-1 text-sm text-gray-400">الاشتراكات + أرباح الملازم</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/30">
                      <BarChart className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                  <p className="mt-4 text-4xl font-black text-white">{isLoadingPayments || isLoadingMaterials ? "..." : totalNetIncome} <span className="text-xl font-medium text-gray-500">ج.م</span></p>
                </div>

                <h4 className="text-lg font-bold text-white mb-2">مالية الاشتراكات الشهرية</h4>
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
                    <p className="mt-4 text-3xl font-bold text-white">{isLoadingPayments ? "..." : totalCollected} <span className="text-sm font-medium text-gray-600">ج.م</span></p>
                  </div>
                  
                  {/* Card 2 */}
                  <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-sm transition-all hover:border-gray-700 hover:shadow-lg hover:shadow-blue-500/5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-400">إجمالي المتوقع</p>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-white">{isLoadingPayments ? "..." : totalExpected} <span className="text-sm font-medium text-gray-600">ج.م</span></p>
                  </div>

                  {/* Card 3 */}
                  <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-sm transition-all hover:border-gray-700 hover:shadow-lg hover:shadow-orange-500/5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-400">المتبقي</p>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <TrendingDown className="h-5 w-5 text-orange-500" />
                      </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-white">{isLoadingPayments ? "..." : totalRemaining} <span className="text-sm font-medium text-gray-600">ج.م</span></p>
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
                    <p className="mt-4 text-3xl font-bold text-white">{isLoadingPayments ? "..." : studentsWithDues}</p>
                  </div>
                </div>

                <h4 className="text-lg font-bold text-white mb-2 mt-6 border-t border-gray-800 pt-6">مالية الملازم والمذكرات</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
                  <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-sm transition-all hover:border-gray-700 hover:shadow-lg">
                    <p className="text-sm font-medium text-gray-400">مبيعات الملازم</p>
                    <p className="mt-4 text-3xl font-bold text-white">{isLoadingMaterials ? "..." : totalMaterialsSales} <span className="text-sm font-medium text-gray-600">ج.م</span></p>
                  </div>
                  <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-sm transition-all hover:border-gray-700 hover:shadow-lg">
                    <p className="text-sm font-medium text-gray-400">تكلفة الملازم</p>
                    <p className="mt-4 text-3xl font-bold text-white">{isLoadingMaterials ? "..." : totalMaterialsCost} <span className="text-sm font-medium text-gray-600">ج.م</span></p>
                  </div>
                  <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-6 shadow-sm transition-all hover:border-purple-500/50">
                    <p className="text-sm font-medium text-purple-400">صافي ربح الملازم</p>
                    <p className="mt-4 text-3xl font-bold text-white">{isLoadingMaterials ? "..." : materialsNetProfit} <span className="text-sm font-medium text-gray-500">ج.م</span></p>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-end gap-3 border-b border-gray-800 pb-8">
                  <div className="w-full sm:w-48">
                    <select 
                      value={financialGroupType}
                      onChange={(e) => setFinancialGroupType(e.target.value)}
                      className="w-full rounded-xl border border-gray-800 bg-[#111827] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm text-gray-300 focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer hover:border-gray-700 transition-colors shadow-sm font-medium"
                    >
                      <option value="الكل">الكل (أنواع)</option>
                      <option value="سنتر">سنتر</option>
                      <option value="أونلاين">أونلاين</option>
                      <option value="برايفت">برايفت</option>
                    </select>
                  </div>
                  <div className="w-full sm:w-48">
                    <select 
                      value={financialGroup}
                      onChange={(e) => setFinancialGroup(e.target.value)}
                      className="w-full rounded-xl border border-gray-800 bg-[#111827] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm text-gray-300 focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer hover:border-gray-700 transition-colors shadow-sm font-medium"
                    >
                      <option value="">كل المجموعات</option>
                      {groups.filter(g => financialGroupType === "الكل" || 
                        (financialGroupType === "سنتر" && g.type === "center") ||
                        (financialGroupType === "أونلاين" && g.type === "online") ||
                        (financialGroupType === "برايفت" && (g.type === "private_group" || g.type === "private_student"))
                      ).map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-48">
                    <input 
                      type="month" 
                      value={financialMonth}
                      onChange={(e) => setFinancialMonth(e.target.value)}
                      className="w-full rounded-xl border border-gray-800 bg-[#111827] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm text-gray-300 focus:border-indigo-500 focus:outline-none cursor-pointer hover:border-gray-700 transition-colors shadow-sm font-medium text-right"
                    />
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
                      <button 
                        onClick={() => setFinancialTab("الكل")}
                        className={`flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all ${financialTab === "الكل" ? "bg-white text-[#111827] shadow-md" : "text-gray-400 hover:text-white"}`}
                      >
                        الكل
                      </button>
                      <button 
                        onClick={() => setFinancialTab("مدفوع")}
                        className={`flex-1 sm:flex-none px-6 py-2 text-sm font-semibold rounded-lg transition-all ${financialTab === "مدفوع" ? "bg-white text-[#111827] shadow-md" : "text-gray-400 hover:text-white"}`}
                      >
                        مدفوع
                      </button>
                      <button 
                        onClick={() => setFinancialTab("متبقي")}
                        className={`flex-1 sm:flex-none px-6 py-2 text-sm font-semibold rounded-lg transition-all ${financialTab === "متبقي" ? "bg-white text-[#111827] shadow-md" : "text-gray-400 hover:text-white"}`}
                      >
                        متبقي
                      </button>
                    </div>
                  </div>

                  {/* Ledger List */}
                  {displayedFinancialStudents.length === 0 ? (
                    <div className="py-24 text-center">
                      <p className="text-gray-600 font-bold text-lg tracking-wide">لا توجد سجلات دفع مطابقة</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {displayedFinancialStudents.map((data, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-800 bg-[#0B1120] hover:border-gray-700 transition-colors shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xl font-bold text-indigo-400 border border-indigo-500/20">
                              {data.student.full_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{data.student.full_name}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {data.group?.name || 'بدون مجموعة'} • {financialMonth}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center min-w-[80px] border ${data.isPaid ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                              {data.isPaid ? `${data.price} ج.م` : '0 ج.م'}
                            </div>
                            <button 
                              onClick={() => handleTogglePayment(data.student.id, data.group?.id, data.isPaid)}
                              className={`p-2 rounded-lg border transition-all ${data.isPaid ? 'border-gray-700 bg-[#111827] text-gray-400 hover:text-red-400 hover:border-red-500/30' : 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white'}`}
                              title={data.isPaid ? "إلغاء الدفع" : "تأكيد الدفع"}
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === "الملازم" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white">الملازم والمذكرات</h3>
                    <p className="mt-1 text-sm text-gray-400">إدارة تسليم ومبيعات الملازم للطلاب</p>
                  </div>
                </div>

                {/* Create Material Form */}
                <div className="bg-[#111827] rounded-2xl border border-gray-800 p-6">
                  <h4 className="text-lg font-bold text-white mb-4">إضافة ملزمة جديدة</h4>
                  <form onSubmit={handleSaveMaterial} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-1 space-y-2">
                      <label className="text-sm font-medium text-gray-300">اسم الملزمة</label>
                      <input required placeholder="مثال: مذكرة مراجعة" value={materialForm.name} onChange={e => setMaterialForm({...materialForm, name: e.target.value})} className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div className="lg:col-span-1 space-y-2">
                      <label className="text-sm font-medium text-gray-300">المجموعة</label>
                      <select required value={materialForm.group_id} onChange={e => setMaterialForm({...materialForm, group_id: e.target.value})} className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none appearance-none">
                        <option value="">اختر المجموعة</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                    <div className="lg:col-span-1 space-y-2">
                      <label className="text-sm font-medium text-gray-300">التكلفة (ج.م)</label>
                      <input type="number" placeholder="0" value={materialForm.cost} onChange={e => setMaterialForm({...materialForm, cost: e.target.value})} className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div className="lg:col-span-1 space-y-2">
                      <label className="text-sm font-medium text-gray-300">سعر البيع (ج.م)</label>
                      <input type="number" placeholder="0" value={materialForm.price} onChange={e => setMaterialForm({...materialForm, price: e.target.value})} className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div className="lg:col-span-1">
                      <button disabled={isSubmittingMaterial} type="submit" className="w-full rounded-xl bg-indigo-600 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm font-bold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        <Plus className="h-4 w-4" /> إضافة
                      </button>
                    </div>
                  </form>
                </div>

                {/* Materials List */}
                <div className="space-y-6">
                  {isLoadingMaterials ? (
                    <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
                  ) : materials.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-[#111827] rounded-2xl border border-gray-800 border-dashed">لا توجد ملازم مسجلة.</div>
                  ) : (
                    materials.map(material => {
                      const groupStudents = students.filter(s => s.group_id === material.group_id);
                      const group = groups.find(g => g.id === material.group_id);
                      
                      return (
                        <div key={material.id} className="bg-[#111827] rounded-2xl border border-gray-800 overflow-hidden">
                          <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex flex-wrap gap-4 justify-between items-center">
                            <div>
                              <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                <BookCheck className="h-5 w-5 text-indigo-400" /> {material.name}
                              </h4>
                              <p className="text-sm text-gray-400 mt-1">{group?.name || 'مجموعة محذوفة'} • التكلفة: {material.cost} ج.م • البيع: {material.price} ج.م</p>
                            </div>
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-4 py-2 text-center min-w-[120px]">
                              <div className="text-xs text-indigo-300">إجمالي المبيعات</div>
                              <div className="font-bold text-indigo-400 mt-1">
                                {materialDistributions.filter(d => d.material_id === material.id && d.status === 'تم التسليم').length * material.price} ج.م
                              </div>
                            </div>
                          </div>
                          <div className="p-4 overflow-x-auto">
                            <table className="w-full text-right text-sm">
                              <thead>
                                <tr className="border-b border-gray-800 text-gray-400">
                                  <th className="pb-3 font-medium">اسم الطالب</th>
                                  <th className="pb-3 font-medium text-center">الحالة</th>
                                  <th className="pb-3 font-medium text-left">إجراء</th>
                                </tr>
                              </thead>
                              <tbody>
                                {groupStudents.length === 0 ? (
                                  <tr><td colSpan={3} className="text-center py-4 text-gray-500">لا يوجد طلاب في هذه المجموعة</td></tr>
                                ) : (
                                  groupStudents.map(student => {
                                    const isDelivered = materialDistributions.some(d => d.material_id === material.id && d.student_id === student.id && d.status === 'تم التسليم');
                                    return (
                                      <tr key={student.id} className="border-b border-gray-800/50 last:border-0 hover:bg-white/5">
                                        <td className="py-3 text-white font-medium">{student.full_name}</td>
                                        <td className="py-3 text-center">
                                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${isDelivered ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                            {isDelivered ? 'تم التسليم' : 'لم يستلم'}
                                          </span>
                                        </td>
                                        <td className="py-3 text-left">
                                          <button 
                                            onClick={() => handleToggleMaterialDistribution(material.id, student.id, isDelivered)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isDelivered ? 'bg-gray-800 text-gray-400 hover:text-red-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                          >
                                            {isDelivered ? 'إلغاء' : 'تسليم للملزمة'}
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : activeTab === "إدارة المساعدين" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white">إدارة المساعدين</h3>
                    <p className="mt-1 text-sm text-gray-400">أضف المساعدين وقم بإدارة صلاحياتهم</p>
                  </div>
                </div>

                <div className="bg-[#111827] rounded-2xl border border-gray-800 p-6">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-400" /> إضافة مساعد جديد</h4>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if(!assistantForm.name || !assistantForm.phone) return;
                    setIsSubmittingAssistant(true);
                    const cleanPhone = getCleanPhone(assistantForm.phone);
                    
                    const { data, error } = await supabase.from('pre_authorized_assistants').insert([{
                      teacher_id: teacherId,
                      name: assistantForm.name,
                      phone: cleanPhone
                    }]).select();
                    
                    setIsSubmittingAssistant(false);
                    if(error) {
                      toast.error("حدث خطأ أثناء إضافة المساعد");
                      console.error(error);
                    } else {
                      toast.success("تم إضافة المساعد بنجاح");
                      setAssistantForm({ name: '', phone: '' });
                      if(data) setPreAuthorizedAssistants(prev => [data[0], ...prev]);
                    }
                  }} className="flex flex-col sm:flex-row gap-4">
                    <input 
                      type="text" 
                      required
                      placeholder="اسم المساعد" 
                      value={assistantForm.name}
                      onChange={(e) => setAssistantForm({...assistantForm, name: e.target.value})}
                      className="flex-1 rounded-xl border border-gray-800 bg-[#0B1120] py-3 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    <input 
                      type="tel" 
                      required
                      dir="ltr"
                      placeholder="رقم الهاتف (مثال: 01xxxxxxxxx)" 
                      value={assistantForm.phone}
                      onChange={(e) => setAssistantForm({...assistantForm, phone: e.target.value})}
                      className="flex-1 rounded-xl border border-gray-800 bg-[#0B1120] py-3 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-left font-mono"
                    />
                    <button 
                      type="submit"
                      disabled={isSubmittingAssistant}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex-shrink-0"
                    >
                      {isSubmittingAssistant ? 'جاري الإضافة...' : 'إضافة مصرح'}
                    </button>
                  </form>
                </div>

                <div className="bg-[#111827] rounded-2xl border border-gray-800 overflow-hidden">
                  <div className="p-4 border-b border-gray-800 bg-[#1f2937]/50">
                    <h4 className="font-bold text-white flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> قائمة المساعدين المصرح لهم بالتسجيل</h4>
                  </div>
                  {isLoadingAssistants ? (
                    <div className="flex justify-center p-8">
                      <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                    </div>
                  ) : preAuthorizedAssistants.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>لا يوجد مساعدين مصرح لهم حالياً</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-right text-gray-300">
                        <thead className="bg-[#1f2937]/30 text-xs uppercase text-gray-400">
                          <tr>
                            <th className="px-6 py-4 font-semibold">الاسم</th>
                            <th className="px-6 py-4 font-semibold text-left">رقم الهاتف</th>
                            <th className="px-6 py-4 font-semibold text-left w-20">إجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {preAuthorizedAssistants.map((assistant) => (
                            <tr key={assistant.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-medium text-white">{assistant.name}</td>
                              <td className="px-6 py-4 font-mono text-left" dir="ltr">{assistant.phone}</td>
                              <td className="px-6 py-4 text-left">
                                <button 
                                  onClick={async () => {
                                    if(confirm('هل أنت متأكد من حذف هذا المصرح؟')) {
                                      const { error } = await supabase.from('pre_authorized_assistants').delete().eq('id', assistant.id);
                                      if(!error) {
                                        toast.success('تم الحذف');
                                        setPreAuthorizedAssistants(prev => prev.filter(a => a.id !== assistant.id));
                                      }
                                    }
                                  }}
                                  className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === "الطلاب" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white">قائمة الطلاب</h3>
                    <p className="mt-1 text-sm text-gray-400">إدارة تفاصيل وبيانات طلابك</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => setIsAddStudentModalOpen(true)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4" />
                      إضافة طالب
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="ابحث عن طالب بالاسم أو الرقم..." 
                    className="w-full rounded-xl border border-gray-800 bg-[#111827] py-3 pr-12 pl-4 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                  />
                </div>

                {/* Group Filters */}
                <div className="flex overflow-x-auto gap-2 pb-2 mb-4 snap-x hide-scrollbar">
                  <button
                    onClick={() => setActiveStudentFilter('الكل')}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors snap-start ${
                      activeStudentFilter === 'الكل'
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        : "bg-[#111827] text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-gray-300"
                    }`}
                  >
                    الكل
                  </button>
                  {groups.map(g => (
                    <button
                      key={g.id}
                      onClick={() => setActiveStudentFilter(g.id)}
                      className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors snap-start ${
                        activeStudentFilter === g.id
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          : "bg-[#111827] text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-gray-300"
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>

                {/* Students List / Empty State */}
                {(() => {
                  const filteredStudentsList = students.filter(s => activeStudentFilter === 'الكل' || s.group_id === activeStudentFilter);
                  
                  if (isLoadingStudents) {
                    return (
                      <div className="flex justify-center py-24">
                        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                      </div>
                    );
                  }
                  
                  if (filteredStudentsList.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-800 bg-[#111827]/40 py-24 text-center mt-8 transition-colors hover:bg-[#111827]/60">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/5">
                          <GraduationCap className="h-8 w-8 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white">لا يوجد طلاب مطابقين</h3>
                        <p className="mt-2 text-sm text-gray-400">أضف طالب جديد أو غيّر التصفية.</p>
                        <button 
                          onClick={() => setIsAddStudentModalOpen(true)}
                          className="mt-6 flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/20 active:scale-95"
                        >
                          <Plus className="h-4 w-4" />
                          إضافة طالب
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-3 mt-8">
                      {filteredStudentsList.map(student => {
                        const group = groups.find(g => g.id === student.group_id);
                        return (
                          <div key={student.id} className="relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-800 bg-[#111827] hover:border-gray-700 hover:bg-[#1f2937] transition-all cursor-pointer group" onClick={() => setContactStudentInfo(student)}>
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 text-lg font-bold text-indigo-300">
                              {student.full_name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">{student.full_name}</h4>
                              <p className="text-xs text-gray-400 mt-1">{group ? group.name : 'بدون مجموعة'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-4 sm:mt-0 justify-end w-full sm:w-auto">
                            <div className="flex items-center gap-2 mr-4" onClick={(e) => e.stopPropagation()}>
                              {(student.student_phone || student.parent_phone) && (
                                <a href={`tel:${student.student_phone || student.parent_phone}`} className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors border border-indigo-500/20" title="اتصال">
                                  <Phone className="w-4 h-4" />
                                </a>
                              )}
                              <button onClick={() => { setWhatsappStudent(student); setIsWhatsAppModalOpen(true); }} className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors border border-green-500/20" title="تقرير واتساب">
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            </div>
                            <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-500/20">
                              منتظم
                            </span>
                            
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={() => setOpenDropdownId(openDropdownId === student.id ? null : student.id)}
                                className="p-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                              >
                                <MoreVertical className="h-5 w-5" />
                              </button>
                              
                              {openDropdownId === student.id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)}></div>
                                  <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-48 rounded-xl border border-gray-700 bg-[#1f2937] shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                    <button onClick={() => { setSelectedStudent(student); setOpenDropdownId(null); }} className="flex w-full items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                      <User className="h-4 w-4" /> الملف الشخصي
                                    </button>
                                    <button onClick={() => { setEditStudentForm(student); setIsEditStudentModalOpen(true); setOpenDropdownId(null); }} className="flex w-full items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                      <Edit className="h-4 w-4" /> تعديل
                                    </button>
                                    <button onClick={() => { setStatsData({ studentName: student.full_name, totalExams: 5, avgScore: '85%' }); setIsStatsModalOpen(true); setOpenDropdownId(null); }} className="flex w-full items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                      <BarChart className="h-4 w-4" /> الإحصائيات
                                    </button>
                                    <button onClick={() => handleWhatsAppReport(student)} className="flex w-full items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm text-green-400 hover:bg-green-500/10 transition-colors border-b border-gray-700/50">
                                      <PhoneCall className="h-4 w-4" /> تقرير واتساب
                                    </button>
                                    <button onClick={() => handleGenerateMonthlyReport(student)} className="flex w-full items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm text-[#25D366] hover:bg-[#25D366]/10 transition-colors border-b border-gray-700/50">
                                      <MessageSquare className="h-4 w-4" /> التقرير الشهري 📱
                                    </button>
                                    <button onClick={() => handleDeleteStudent(student.id)} className="flex w-full items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                                      <Trash2 className="h-4 w-4" /> حذف
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            ) : activeTab === "باقات معلمي" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Status Card */}
                  <div className="flex-1 bg-[#111827] rounded-3xl p-6 border border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">الخطة الحالية</p>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        {teacherPlan === 'monthly' ? 'الخطة الشهرية' : teacherPlan === 'golden' ? 'الخطة الذهبية' : teacherPlan === 'diamond' ? 'الخطة الماسية' : teacherPlan === 'royal' ? 'الخطة الملكية' : teacherPlan}
                        <span className={`text-xs px-2 py-1 rounded-md font-medium ${(!teacherExpires || new Date(teacherExpires) > new Date()) ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {(!teacherExpires || new Date(teacherExpires) > new Date()) ? 'نشط' : 'منتهي'}
                        </span>
                      </h2>
                      <p className="text-sm text-gray-400 mt-2">
                        {teacherExpires 
                          ? `تنتهي في: ${new Date(teacherExpires).toLocaleDateString('ar-EG')} ` + 
                            (() => {
                              const days = Math.ceil((new Date(teacherExpires).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                              return days > 0 ? `(متبقي ${days} يوم)` : '(انتهى الاشتراك)';
                            })()
                          : 'الاشتراك التجريبي نشط'
                        }
                      </p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                      <Crown className="w-8 h-8" />
                    </div>
                  </div>
                  
                  {/* License Code Card */}
                  <div className="flex-1 bg-gradient-to-br from-indigo-900/40 to-[#111827] rounded-3xl p-6 border border-indigo-500/20 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full"></div>
                    <h3 className="text-lg font-bold text-white mb-4 relative z-10">تفعيل كود الاشتراك</h3>
                    <form onSubmit={handleActivateLicense} className="flex gap-2 relative z-10">
                      <input 
                        type="text" 
                        placeholder="أدخل كود التفعيل هنا..." 
                        value={activationCode}
                        onChange={(e) => setActivationCode(e.target.value)}
                        className="flex-1 bg-[#0B1120] border border-gray-700 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 font-mono tracking-wider text-center"
                        dir="ltr"
                      />
                      <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-6 py-3 transition-colors shadow-lg shadow-indigo-500/20">
                        تفعيل
                      </button>
                    </form>
                  </div>
                </div>

                {/* Pricing Grid */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6 text-center mt-10">اختر الباقة المناسبة لك</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* Monthly Plan */}
                    <div className="bg-[#111827] rounded-3xl p-6 border border-gray-800 flex flex-col hover:border-indigo-500/50 transition-colors">
                      <h4 className="text-xl font-bold text-white mb-2">الخطة الشهرية</h4>
                      <div className="text-3xl font-bold text-white mb-4">100 <span className="text-sm text-gray-400 font-normal">ج.م / شهرياً</span></div>
                      <ul className="space-y-3 mb-6 flex-1">
                        <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle className="w-4 h-4 text-green-400" /> إدارة الطلاب والحضور</li>
                        <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle className="w-4 h-4 text-green-400" /> السجل المالي والتقارير</li>
                        <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle className="w-4 h-4 text-green-400" /> دعم فني مباشر</li>
                      </ul>
                      <button onClick={() => {
                        const msg = encodeURIComponent(`طلب الخطة الشهرية (100 ج.م)\nالاسم: ${teacherName}\nرقم الهاتف: ${teacherPhone}`);
                        window.open(`https://wa.me/201040971231?text=${msg}`, '_blank');
                      }} className="w-full py-3 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors">شراء الباقة عبر واتساب</button>
                    </div>

                    {/* Golden Plan */}
                    <div className="bg-[#111827] rounded-3xl p-6 border border-gray-800 flex flex-col hover:border-yellow-500/50 transition-colors">
                      <h4 className="text-xl font-bold text-yellow-400 mb-2">الخطة الذهبية</h4>
                      <div className="text-3xl font-bold text-white mb-4">300 <span className="text-sm text-gray-400 font-normal">ج.م / 6 أشهر</span></div>
                      <ul className="space-y-3 mb-6 flex-1">
                        <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle className="w-4 h-4 text-green-400" /> جميع مميزات الخطة الشهرية</li>
                        <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle className="w-4 h-4 text-green-400" /> توفير 300 ج.م</li>
                        <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle className="w-4 h-4 text-green-400" /> أولوية الدعم الفني</li>
                      </ul>
                      <button onClick={() => {
                        const msg = encodeURIComponent(`طلب الخطة الذهبية (300 ج.م)\nالاسم: ${teacherName}\nرقم الهاتف: ${teacherPhone}`);
                        window.open(`https://wa.me/201040971231?text=${msg}`, '_blank');
                      }} className="w-full py-3 rounded-xl bg-yellow-500/10 text-yellow-500 font-bold hover:bg-yellow-500/20 transition-colors border border-yellow-500/20">شراء الباقة عبر واتساب</button>
                    </div>

                    {/* Diamond Plan */}
                    <div className="bg-gradient-to-b from-[#111827] to-[#1f2937] rounded-3xl p-6 border-2 border-indigo-500 flex flex-col relative transform lg:-translate-y-4 z-10 shadow-2xl shadow-indigo-500/20">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg whitespace-nowrap">
                        <Sparkles className="w-3 h-3" /> الأكثر طلباً
                      </div>
                      <h4 className="text-xl font-bold text-indigo-400 mb-2 mt-2">الخطة الماسية</h4>
                      <div className="text-3xl font-bold text-white mb-4">600 <span className="text-sm text-gray-400 font-normal">ج.م / سنة</span></div>
                      <ul className="space-y-3 mb-6 flex-1">
                        <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle className="w-4 h-4 text-indigo-400" /> عام دراسي كامل بدون توقف</li>
                        <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle className="w-4 h-4 text-indigo-400" /> توفير 600 ج.م</li>
                        <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle className="w-4 h-4 text-indigo-400" /> كافة التحديثات القادمة</li>
                      </ul>
                      <button onClick={() => {
                        const msg = encodeURIComponent(`طلب الخطة الماسية (600 ج.م)\nالاسم: ${teacherName}\nرقم الهاتف: ${teacherPhone}`);
                        window.open(`https://wa.me/201040971231?text=${msg}`, '_blank');
                      }} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">شراء الباقة عبر واتساب</button>
                    </div>

                    {/* Royal Plan */}
                    <div className="bg-[#111827] rounded-3xl p-6 border border-gray-800 flex flex-col hover:border-purple-500/50 transition-colors">
                      <h4 className="text-xl font-bold text-purple-400 mb-2">الخطة الملكية</h4>
                      <div className="text-3xl font-bold text-white mb-4">2,000 <span className="text-sm text-gray-400 font-normal">ج.م / للأبد</span></div>
                      <ul className="space-y-3 mb-6 flex-1">
                        <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle className="w-4 h-4 text-green-400" /> ترخيص مدى الحياة</li>
                        <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle className="w-4 h-4 text-green-400" /> دفع مرة واحدة فقط</li>
                        <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle className="w-4 h-4 text-green-400" /> مدير حسابات شخصي</li>
                      </ul>
                      <button onClick={() => {
                        const msg = encodeURIComponent(`طلب الخطة الملكية (2,000 ج.م)\nالاسم: ${teacherName}\nرقم الهاتف: ${teacherPhone}`);
                        window.open(`https://wa.me/201040971231?text=${msg}`, '_blank');
                      }} className="w-full py-3 rounded-xl bg-purple-500/10 text-purple-400 font-bold hover:bg-purple-500/20 transition-colors border border-purple-500/20">شراء الباقة عبر واتساب</button>
                    </div>

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
          <div className="w-full max-w-lg rounded-2xl border border-gray-700 bg-[#111827] shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between border-b border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white">{editingGroup ? "تعديل مجموعة" : "إضافة مجموعة جديدة"}</h2>
              <button onClick={() => { setIsGroupModalOpen(false); setEditingGroup(null); setNewGroup({ name: '', subject: '', type: 'center', price: '', whatsapp_link: '' }); setNewGroupSchedules([]); }} className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">اسم المجموعة</label>
                <input type="text" className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none" placeholder="مثال: مجموعة السبت 4 عصراً" value={newGroup.name} onChange={(e) => setNewGroup({...newGroup, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">المادة</label>
                  <input type="text" className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none" placeholder="مثال: الرياضيات، الفيزياء..." value={newGroup.subject} onChange={(e) => setNewGroup({...newGroup, subject: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">نوع المجموعة</label>
                  <select className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none appearance-none" value={newGroup.type} onChange={(e) => setNewGroup({...newGroup, type: e.target.value})}>
                    <option value="center">سنتر</option>
                    <option value="online">أونلاين</option>
                    <option value="private_group">م.ج برايفت</option>
                    <option value="private_student">طالب برايفت</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">سعر الحصة / الشهر</label>
                  <input type="number" className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none" placeholder="0" value={newGroup.price} onChange={(e) => setNewGroup({...newGroup, price: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">طريقة الدفع</label>
                  <select className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none appearance-none">
                    <option>بالحصة</option>
                    <option>بالشهر</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">رابط جروب الواتساب (اختياري)</label>
                <div className="relative">
                  <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input type="url" className="w-full rounded-xl border border-gray-700 bg-[#0B1120] py-2.5 pr-10 pl-4 text-white focus:border-indigo-500 focus:outline-none text-left dir-ltr" placeholder="https://chat.whatsapp.com/..." value={newGroup.whatsapp_link} onChange={(e) => setNewGroup({...newGroup, whatsapp_link: e.target.value})} />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">مواعيد المجموعة</label>
                <div className="grid grid-cols-1 gap-2 border border-gray-800 rounded-xl p-3 bg-[#0B1120]/50">
                  {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((day) => {
                    const existingSchedule = newGroupSchedules.find(s => s.day === day);
                    const isActive = !!existingSchedule;
                    
                    return (
                      <div key={day} className={`flex items-center justify-between p-2 rounded-lg transition-colors border ${isActive ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-[#111827] border-gray-800 hover:border-gray-700'}`}>
                        <span className={`text-sm font-medium w-24 ${isActive ? 'text-indigo-400' : 'text-gray-400'}`}>{day}</span>
                        <input 
                          type="time" 
                          className={`rounded-lg bg-[#0B1120] px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors ${isActive ? 'text-white border-indigo-500/50' : 'text-gray-500 border-gray-700'}`}
                          value={existingSchedule?.time || ''}
                          onChange={(e) => {
                            const newTime = e.target.value;
                            if (newTime) {
                              setNewGroupSchedules(prev => {
                                const filtered = prev.filter(s => s.day !== day);
                                return [...filtered, { day, time: newTime }];
                              });
                            } else {
                              setNewGroupSchedules(prev => prev.filter(s => s.day !== day));
                            }
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 p-6 flex gap-3">
              <button onClick={handleAddGroup} disabled={isSubmittingGroup} className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50">
                {isSubmittingGroup ? "جاري الحفظ..." : (editingGroup ? "تحديث البيانات" : "حفظ وإنشاء")}
              </button>
              <button onClick={() => setIsGroupModalOpen(false)} className="rounded-xl border border-gray-700 bg-[#0B1120] px-6 py-3 text-sm font-bold text-gray-300 transition-colors hover:bg-white/5 active:scale-95">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Standard Student Modal */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-gray-700 bg-[#111827] shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white">إضافة طالب جديد</h2>
              <button onClick={() => setIsAddStudentModalOpen(false)} className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">اسم الطالب</label>
                <input type="text" className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none" placeholder="الاسم ثلاثي" value={newStudent.full_name} onChange={(e) => setNewStudent({...newStudent, full_name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">المجموعة</label>
                <select className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-sm text-white focus:border-indigo-500 focus:outline-none" value={newStudent.group_id} onChange={(e) => setNewStudent({...newStudent, group_id: e.target.value})}>
                  <option value="">اختر المجموعة...</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name} - {group.subject}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">رقم ولي الأمر</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input type="tel" className="w-full rounded-xl border border-gray-700 bg-[#0B1120] py-2.5 pr-9 pl-4 text-white focus:border-indigo-500 focus:outline-none text-left dir-ltr" placeholder="01..." value={newStudent.parent_phone} onChange={(e) => setNewStudent({...newStudent, parent_phone: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">رقم هاتف الطالب</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input type="tel" className="w-full rounded-xl border border-gray-700 bg-[#0B1120] py-2.5 pr-9 pl-4 text-white focus:border-indigo-500 focus:outline-none text-left dir-ltr" placeholder="01..." value={newStudent.student_phone} onChange={(e) => setNewStudent({...newStudent, student_phone: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 p-6 flex gap-3">
              <button 
                onClick={handleAddStudent} 
                disabled={isSubmittingStudent || !newStudent.full_name || !newStudent.group_id} 
                className="flex-[2] rounded-xl bg-indigo-600 py-3 font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                {isSubmittingStudent ? "جاري الإضافة..." : "إضافة الطالب"}
              </button>
              <button onClick={() => setIsAddStudentModalOpen(false)} className="flex-1 rounded-xl border border-gray-700 bg-[#0B1120] py-3 text-sm font-bold text-gray-300 transition-colors hover:bg-white/5 active:scale-95">
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
                <input type="text" className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none" placeholder="الاسم ثلاثي" value={newPrivateStudent.full_name} onChange={(e) => setNewPrivateStudent({...newPrivateStudent, full_name: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">رقم هاتف الطالب</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input type="tel" className="w-full rounded-xl border border-gray-700 bg-[#0B1120] py-2.5 pr-9 pl-4 text-white focus:border-indigo-500 focus:outline-none text-left dir-ltr" placeholder="01..." value={newPrivateStudent.student_phone} onChange={(e) => setNewPrivateStudent({...newPrivateStudent, student_phone: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">رقم ولي الأمر</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input type="tel" className="w-full rounded-xl border border-gray-700 bg-[#0B1120] py-2.5 pr-9 pl-4 text-white focus:border-indigo-500 focus:outline-none text-left dir-ltr" placeholder="01..." value={newPrivateStudent.parent_phone} onChange={(e) => setNewPrivateStudent({...newPrivateStudent, parent_phone: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">المادة</label>
                  <div className="relative">
                    <select className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none appearance-none" value={newPrivateStudent.subject} onChange={(e) => setNewPrivateStudent({...newPrivateStudent, subject: e.target.value})}>
                      <option value="">اختر المادة</option>
                      <option value="لغة عربية">لغة عربية</option>
                      <option value="لغة إنجليزية">لغة إنجليزية</option>
                      <option value="رياضيات">رياضيات</option>
                      <option value="علوم">علوم</option>
                      <option value="فيزياء">فيزياء</option>
                      <option value="كيمياء">كيمياء</option>
                      <option value="أحياء">أحياء</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">طريقة الدفع</label>
                  <select className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none appearance-none" value={newPrivateStudent.payment_method} onChange={(e) => setNewPrivateStudent({...newPrivateStudent, payment_method: e.target.value})}>
                    <option value="دفع شهري">دفع شهري</option>
                    <option value="دفع بالحصة">دفع بالحصة</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    {newPrivateStudent.payment_method === 'دفع بالحصة' ? 'سعر الحصة' : 'سعر الشهر'}
                  </label>
                  <input type="number" className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none" placeholder="ج.م" value={newPrivateStudent.price} onChange={(e) => setNewPrivateStudent({...newPrivateStudent, price: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">بداية المجموعة (اختياري)</label>
                  <input type="date" className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-4 py-2 text-white focus:border-indigo-500 focus:outline-none text-sm" value={newPrivateStudent.start_date} onChange={(e) => setNewPrivateStudent({...newPrivateStudent, start_date: e.target.value})} />
                  <p className="text-[10px] text-gray-500 mt-1">مثال: 15/08، وتكون الدورة الشهرية من 15/08 إلى 15/09</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-2">
                <label className="text-sm font-medium text-gray-300">جدول المواعيد</label>
                <div className="grid grid-cols-1 gap-2 border border-gray-800 rounded-xl p-3 bg-[#0B1120]/50">
                  {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((day) => {
                    const existingSchedule = privateSchedules.find(s => s.day === day);
                    const isActive = !!existingSchedule;
                    
                    return (
                      <div key={day} className={`flex items-center justify-between p-2 rounded-lg transition-colors border ${isActive ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-[#111827] border-gray-800 hover:border-gray-700'}`}>
                        <span className={`text-sm font-medium w-24 ${isActive ? 'text-indigo-400' : 'text-gray-400'}`}>{day}</span>
                        <input 
                          type="time" 
                          className={`rounded-lg bg-[#0B1120] px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors ${isActive ? 'text-white border-indigo-500/50' : 'text-gray-500 border-gray-700'}`}
                          value={existingSchedule?.time || ''}
                          onChange={(e) => {
                            const newTime = e.target.value;
                            if (newTime) {
                              setPrivateSchedules(prev => {
                                const filtered = prev.filter(s => s.day !== day);
                                return [...filtered, { day, time: newTime }];
                              });
                            } else {
                              setPrivateSchedules(prev => prev.filter(s => s.day !== day));
                            }
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 p-6 flex gap-3">
              <button onClick={handleAddPrivateStudent} disabled={isSubmittingPrivate} className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50">
                {isSubmittingPrivate ? "جاري الحفظ..." : "إنشاء سجل الطالب"}
              </button>
              <button onClick={() => setIsPrivateModalOpen(false)} className="rounded-xl border border-gray-700 bg-[#0B1120] px-6 py-3 text-sm font-bold text-gray-300 transition-colors hover:bg-white/5 active:scale-95">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl rounded-2xl border border-gray-700 bg-[#0B1120] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Header Area */}
            <div className="relative bg-[#111827] border-b border-gray-800 px-6 pt-8 pb-6">
              <div className="absolute top-4 right-4">
                <button onClick={() => setSelectedStudent(null)} className="rounded-full p-2 bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/30 text-4xl font-bold text-indigo-300 shadow-xl">
                  {selectedStudent.full_name.charAt(0)}
                </div>
                <div className="text-center sm:text-right flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedStudent.full_name}</h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <span className="inline-flex items-center rounded-md bg-gray-800 px-3 py-1 text-sm font-medium text-gray-300 border border-gray-700">
                      <Users className="w-4 h-4 ml-2 opacity-50" />
                      {groups.find(g => g.id === selectedStudent.group_id)?.name || 'غير محدد'}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400 border border-green-500/20">
                      منتظم
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                    {selectedStudent.student_phone && (
                      <a href={`tel:${selectedStudent.student_phone}`} className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors border border-gray-700">
                        <PhoneCall className="h-4 w-4 text-indigo-400" />
                        اتصال بالطالب
                      </a>
                    )}
                    {selectedStudent.parent_phone && (
                      <a href={`tel:${selectedStudent.parent_phone}`} className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors border border-gray-700">
                        <PhoneCall className="h-4 w-4 text-purple-400" />
                        اتصال بولي الأمر
                      </a>
                    )}
                    <button onClick={() => handleWhatsAppReport(selectedStudent)} className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 hover:bg-green-500/20 transition-colors border border-green-500/20">
                      <MessageSquare className="h-4 w-4" />
                      إرسال تقرير واتساب
                    </button>
                    <button onClick={() => handleGenerateMonthlyReport(selectedStudent)} className="flex items-center gap-2 rounded-lg bg-[#25D366]/10 px-4 py-2 text-sm font-medium text-[#25D366] hover:bg-[#25D366]/20 transition-colors border border-[#25D366]/20">
                      <MessageSquare className="h-4 w-4" />
                      إرسال التقرير الشهري 📱
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-800 bg-[#111827] px-6 overflow-x-auto scrollbar-hide">
              {['الحضور', 'الواجب', 'التسميع', 'الدفع', 'الامتحانات']
                .filter(tab => !(userRole === 'assistant' && tab === 'الدفع'))
                .map(tab => (
                <button
                  key={tab}
                  onClick={() => setStudentProfileTab(tab)}
                  className={`whitespace-nowrap px-6 py-4 text-sm font-bold transition-all border-b-2 ${
                    studentProfileTab === tab
                      ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                      : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#0B1120] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              
              {/* --- الواجب (Homework) --- */}
              {studentProfileTab === 'الواجب' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="bg-[#111827] rounded-xl border border-gray-800 p-5">
                    <h3 className="text-lg font-bold text-white mb-4">تسجيل الواجب</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">تاريخ الحصة</label>
                        <input type="date" value={hwForm.date} onChange={(e) => setHwForm({...hwForm, date: e.target.value})} className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">حالة الواجب</label>
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => setHwForm({...hwForm, status: 'كتب الواجب'})} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${hwForm.status === 'كتب الواجب' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-white/5 border-gray-700 text-gray-400 hover:bg-white/10'}`}>كتب الواجب</button>
                          <button onClick={() => setHwForm({...hwForm, status: 'لم ينجز'})} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${hwForm.status === 'لم ينجز' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/5 border-gray-700 text-gray-400 hover:bg-white/10'}`}>لم ينجز</button>
                          <button onClick={() => setHwForm({...hwForm, status: 'متأخر'})} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${hwForm.status === 'متأخر' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'bg-white/5 border-gray-700 text-gray-400 hover:bg-white/10'}`}>متأخر</button>
                          <button onClick={() => setHwForm({...hwForm, status: 'لا يوجد'})} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${hwForm.status === 'لا يوجد' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white/5 border-gray-700 text-gray-400 hover:bg-white/10'}`}>لا يوجد</button>
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-gray-300">ملاحظات (اختياري)</label>
                        <textarea value={hwForm.notes} onChange={(e) => setHwForm({...hwForm, notes: e.target.value})} className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none min-h-[100px]" placeholder="مثال: لم يكمل سؤالين من الصفحة الثانية..."></textarea>
                      </div>
                    </div>
                    <div className="mt-5 flex justify-end">
                      <button onClick={handleSaveHomework} disabled={isSubmittingHw} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 disabled:opacity-50">
                        {isSubmittingHw ? 'جاري الحفظ...' : 'حفظ حالة الواجب'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">سجل الواجبات</h3>
                    <div className="space-y-3">
                      {homeworkHistory.length === 0 ? (
                        <div className="text-center py-8 bg-[#111827] border border-gray-800 rounded-xl text-gray-500">لا توجد سجلات للواجب</div>
                      ) : (
                        homeworkHistory.map((hw: any) => (
                          <div key={hw.id} className="flex items-center justify-between bg-[#111827] border border-gray-800 p-4 rounded-xl">
                            <div className="flex items-center gap-4">
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${
                                hw.status === 'كتب الواجب' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                hw.status === 'لم ينجز' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                hw.status === 'متأخر' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                'bg-gray-800 border-gray-700 text-gray-400'
                              }`}>
                                <BookCheck className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-bold text-white">{hw.status}</p>
                                <p className="text-xs text-gray-400 mt-1">تاريخ الحصة: {hw.date}</p>
                                {hw.notes && <p className="text-xs text-gray-500 mt-1">{hw.notes}</p>}
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">{new Date(hw.created_at).toLocaleDateString('ar-EG')}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* --- الدفع (Payment) --- */}
              {(userRole === 'teacher' || userRole === 'super_admin') && studentProfileTab === 'الدفع' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="bg-[#111827] rounded-xl border border-gray-800 p-5">
                    <h3 className="text-lg font-bold text-white mb-4">تسجيل الدفع</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">الشهر</label>
                        <input type="month" value={paymentForm.month} onChange={(e) => setPaymentForm({...paymentForm, month: e.target.value})} className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none appearance-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">تاريخ الاستحقاق/الدفع</label>
                        <input type="date" value={paymentForm.date} onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})} className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none" />
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button onClick={() => handleSavePayment('مدفوع')} disabled={isSubmittingPayment} className="flex-1 rounded-xl bg-indigo-600 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-sm font-bold text-white hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50">
                        <DollarSign className="h-4 w-4" /> تسجيل كمدفوع
                      </button>
                      <button onClick={() => handleSavePayment('معفي')} disabled={isSubmittingPayment} className="flex-1 rounded-xl bg-orange-500/10 border border-orange-500/30 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-sm font-bold text-orange-400 hover:bg-orange-500/20 disabled:opacity-50">
                        معفي
                      </button>
                      <button onClick={() => handleSavePayment('لم يدفع')} disabled={isSubmittingPayment} className="flex-1 rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-sm font-bold text-red-400 hover:bg-red-500/20 disabled:opacity-50">
                        لم يدفع
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">سجل المدفوعات</h3>
                    <div className="space-y-3">
                      {payments.filter((p: any) => p.student_id === selectedStudent.id).length === 0 ? (
                        <div className="text-center py-8 bg-[#111827] border border-gray-800 rounded-xl text-gray-500">لا توجد سجلات دفع</div>
                      ) : (
                        payments.filter((p: any) => p.student_id === selectedStudent.id).map((payment: any) => (
                          <div key={payment.id} className="flex items-center justify-between bg-[#111827] border border-gray-800 p-4 rounded-xl">
                            <div className="flex items-center gap-4">
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${
                                payment.status === 'مدفوع' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                payment.status === 'معفي' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                                'bg-red-500/10 border-red-500/20 text-red-400'
                              }`}>
                                <Wallet className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-bold text-white">{payment.month || 'غير محدد'}</p>
                                <p className={`text-xs mt-1 ${payment.status === 'مدفوع' ? 'text-green-400' : payment.status === 'معفي' ? 'text-orange-400' : 'text-red-400'}`}>{payment.status || payment.payment_status || 'مسجل'}</p>
                              </div>
                            </div>
                            <span className="font-bold text-white">{payment.amount || payment.amount_paid || 0} ج.م</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* --- الامتحانات (Exams) --- */}
              {studentProfileTab === 'الامتحانات' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="bg-[#111827] rounded-xl border border-gray-800 p-5">
                    <h3 className="text-lg font-bold text-white mb-4">تسجيل درجة امتحان</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">اسم الامتحان</label>
                        <input type="text" value={examForm.name} onChange={(e) => setExamForm({...examForm, name: e.target.value})} className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none" placeholder="امتحان الشهر الأول" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">تاريخ الامتحان</label>
                        <input type="date" value={examForm.date} onChange={(e) => setExamForm({...examForm, date: e.target.value})} className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">درجة الطالب</label>
                        <div className="flex items-center gap-2">
                          <input type="number" value={examForm.score} onChange={(e) => setExamForm({...examForm, score: e.target.value})} className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none text-center" placeholder="الدرجة" />
                          <span className="text-gray-500">/</span>
                          <input type="number" value={examForm.total_score} onChange={(e) => setExamForm({...examForm, total_score: e.target.value})} className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none text-center" placeholder="النهائية" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">ملاحظات (اختياري)</label>
                        <input type="text" value={examForm.notes} onChange={(e) => setExamForm({...examForm, notes: e.target.value})} className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none" placeholder="مستوى جيد..." />
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button onClick={handleSaveExam} disabled={isSubmittingExam} className="flex-1 rounded-xl bg-indigo-600 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
                        {isSubmittingExam ? 'جاري الحفظ...' : 'حفظ الدرجة'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">سجل الامتحانات</h3>
                    <div className="space-y-3">
                      {examsHistory.length === 0 ? (
                        <div className="text-center py-8 bg-[#111827] border border-gray-800 rounded-xl text-gray-500">لا توجد سجلات امتحانات</div>
                      ) : (
                        examsHistory.map((exam: any) => (
                          <div key={exam.id} className="flex items-center justify-between bg-[#111827] border border-gray-800 p-4 rounded-xl">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                <Star className="h-5 w-5 text-indigo-400" />
                              </div>
                              <div>
                                <p className="font-bold text-white">{exam.exam_name}</p>
                                <p className="text-xs text-gray-400 mt-1">تاريخ: {exam.exam_date}</p>
                                {exam.notes && <p className="text-xs text-gray-500 mt-1">{exam.notes}</p>}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 text-left">
                              <span className="font-bold text-indigo-400 text-lg">{exam.score}<span className="text-sm text-gray-500">/{exam.total_score || 0}</span></span>
                              <div className="flex items-center gap-2 mt-1">
                                <button onClick={() => handlePrintCertificate(selectedStudent, exam)} className="text-xs flex items-center gap-1 text-[#d4af37] hover:text-yellow-300 bg-[#d4af37]/10 px-3 py-1.5 rounded-lg border border-[#d4af37]/30 transition-colors">
                                  <Crown className="w-3 h-3" /> شهادة تقدير
                                </button>
                                <button onClick={() => handleExamWhatsAppReport(exam)} className="text-xs flex items-center gap-1 text-green-400 hover:text-green-300 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20 transition-colors">
                                  <PhoneCall className="w-3 h-3" /> التقرير
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* --- الحضور (Attendance) --- */}
              {studentProfileTab === 'الحضور' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="bg-[#111827] rounded-xl border border-gray-800 p-5">
                    <h3 className="text-lg font-bold text-white mb-4">تسجيل الحضور</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">تاريخ الحصة</label>
                        <input type="date" value={attendanceForm.date} onChange={(e) => setAttendanceForm({...attendanceForm, date: e.target.value})} className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">حالة الحضور</label>
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => setAttendanceForm({...attendanceForm, status: 'حاضر'})} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${attendanceForm.status === 'حاضر' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-white/5 border-gray-700 text-gray-400 hover:bg-white/10'}`}>حاضر</button>
                          <button onClick={() => setAttendanceForm({...attendanceForm, status: 'غائب'})} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${attendanceForm.status === 'غائب' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/5 border-gray-700 text-gray-400 hover:bg-white/10'}`}>غائب</button>
                          <button onClick={() => setAttendanceForm({...attendanceForm, status: 'متأخر'})} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${attendanceForm.status === 'متأخر' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'bg-white/5 border-gray-700 text-gray-400 hover:bg-white/10'}`}>متأخر</button>
                          <button onClick={() => setAttendanceForm({...attendanceForm, status: 'معتذر'})} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${attendanceForm.status === 'معتذر' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white/5 border-gray-700 text-gray-400 hover:bg-white/10'}`}>معتذر</button>
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-gray-300">ملاحظات (اختياري)</label>
                        <textarea value={attendanceForm.notes} onChange={(e) => setAttendanceForm({...attendanceForm, notes: e.target.value})} className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none min-h-[80px]" placeholder="مثال: غاب بسبب المرض..."></textarea>
                      </div>
                    </div>
                    <div className="mt-5 flex justify-end">
                      <button onClick={handleSaveAttendance} disabled={isSubmittingAttendance} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 disabled:opacity-50">
                        {isSubmittingAttendance ? 'جاري الحفظ...' : 'حفظ حالة الحضور'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">سجل الحضور</h3>
                    <div className="space-y-3">
                      {attendanceHistory.length === 0 ? (
                        <div className="text-center py-8 bg-[#111827] border border-gray-800 rounded-xl text-gray-500">لا توجد سجلات للحضور</div>
                      ) : (
                        attendanceHistory.map((att: any) => (
                          <div key={att.id} className="flex items-center justify-between bg-[#111827] border border-gray-800 p-4 rounded-xl">
                            <div className="flex items-center gap-4">
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${
                                att.status === 'حاضر' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                att.status === 'غائب' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                att.status === 'متأخر' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                'bg-gray-800 border-gray-700 text-gray-400'
                              }`}>
                                <Clock className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-bold text-white">{att.status}</p>
                                <p className="text-xs text-gray-400 mt-1">تاريخ الحصة: {att.date}</p>
                                {att.notes && <p className="text-xs text-gray-500 mt-1">{att.notes}</p>}
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">{new Date(att.created_at).toLocaleDateString('ar-EG')}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* --- التسميع (Recitation) --- */}
              {studentProfileTab === 'التسميع' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="bg-[#111827] rounded-xl border border-gray-800 p-5">
                    <h3 className="text-lg font-bold text-white mb-4">تسجيل التسميع</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">تاريخ التسميع</label>
                        <input type="date" value={recitationForm.date} onChange={(e) => setRecitationForm({...recitationForm, date: e.target.value})} className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">التقييم</label>
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => setRecitationForm({...recitationForm, grade: 'ممتاز'})} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${recitationForm.grade === 'ممتاز' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-white/5 border-gray-700 text-gray-400 hover:bg-white/10'}`}>ممتاز</button>
                          <button onClick={() => setRecitationForm({...recitationForm, grade: 'جيد جدا'})} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${recitationForm.grade === 'جيد جدا' ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-white/5 border-gray-700 text-gray-400 hover:bg-white/10'}`}>جيد جدا</button>
                          <button onClick={() => setRecitationForm({...recitationForm, grade: 'جيد'})} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${recitationForm.grade === 'جيد' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'bg-white/5 border-gray-700 text-gray-400 hover:bg-white/10'}`}>جيد</button>
                          <button onClick={() => setRecitationForm({...recitationForm, grade: 'ضعيف'})} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${recitationForm.grade === 'ضعيف' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/5 border-gray-700 text-gray-400 hover:bg-white/10'}`}>ضعيف</button>
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-gray-300">ملاحظات (اختياري)</label>
                        <textarea value={recitationForm.notes} onChange={(e) => setRecitationForm({...recitationForm, notes: e.target.value})} className="w-full rounded-xl border border-gray-700 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none min-h-[80px]" placeholder="مثال: بحاجة إلى مراجعة..."></textarea>
                      </div>
                    </div>
                    <div className="mt-5 flex justify-end">
                      <button onClick={handleSaveRecitation} disabled={isSubmittingRecitation} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 disabled:opacity-50">
                        {isSubmittingRecitation ? 'جاري الحفظ...' : 'حفظ التقييم'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">سجل التسميع</h3>
                    <div className="space-y-3">
                      {recitationHistory.length === 0 ? (
                        <div className="text-center py-8 bg-[#111827] border border-gray-800 rounded-xl text-gray-500">لا توجد سجلات للتسميع</div>
                      ) : (
                        recitationHistory.map((rec: any) => (
                          <div key={rec.id} className="flex items-center justify-between bg-[#111827] border border-gray-800 p-4 rounded-xl">
                            <div className="flex items-center gap-4">
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${
                                rec.grade === 'ممتاز' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                rec.grade === 'جيد جدا' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                                rec.grade === 'جيد' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                'bg-red-500/10 border-red-500/20 text-red-400'
                              }`}>
                                <BookCheck className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-bold text-white">{rec.grade}</p>
                                <p className="text-xs text-gray-400 mt-1">تاريخ: {rec.date}</p>
                                {rec.notes && <p className="text-xs text-gray-500 mt-1">{rec.notes}</p>}
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">{new Date(rec.created_at).toLocaleDateString('ar-EG')}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditStudentModalOpen && editStudentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-gray-700 bg-[#0B1120] p-6 shadow-2xl relative">
            <h2 className="mb-6 text-2xl font-bold text-white">تعديل بيانات الطالب</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">اسم الطالب</label>
                <input type="text" value={editStudentForm.full_name} onChange={(e) => setEditStudentForm({...editStudentForm, full_name: e.target.value})} className="w-full rounded-xl border border-gray-700 bg-[#111827] px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">المجموعة</label>
                <select value={editStudentForm.group_id} onChange={(e) => setEditStudentForm({...editStudentForm, group_id: e.target.value})} className="w-full rounded-xl border border-gray-700 bg-[#111827] px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none appearance-none">
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">رقم ولي الأمر</label>
                <input type="text" value={editStudentForm.parent_phone} onChange={(e) => setEditStudentForm({...editStudentForm, parent_phone: e.target.value})} className="w-full rounded-xl border border-gray-700 bg-[#111827] px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">رقم الطالب (اختياري)</label>
                <input type="text" value={editStudentForm.student_phone || ''} onChange={(e) => setEditStudentForm({...editStudentForm, student_phone: e.target.value})} className="w-full rounded-xl border border-gray-700 bg-[#111827] px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none" />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={() => setIsEditStudentModalOpen(false)} className="flex-1 rounded-xl bg-gray-800 py-3 font-bold text-white hover:bg-gray-700 transition-colors">
                إلغاء
              </button>
              <button onClick={handleEditStudentSave} disabled={isSubmittingEditStudent} className="flex-1 rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50">
                {isSubmittingEditStudent ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Dummy Modal */}
      {isStatsModalOpen && statsData && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-gray-700 bg-[#0B1120] p-6 shadow-2xl relative">
            <h2 className="mb-4 text-xl font-bold text-white">إحصائيات الطالب</h2>
            <p className="text-indigo-400 mb-6 text-sm">{statsData.studentName}</p>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-[#111827] p-4 rounded-xl border border-gray-800">
                <span className="text-gray-400">إجمالي الامتحانات</span>
                <span className="text-white font-bold">{statsData.totalExams}</span>
              </div>
              <div className="flex justify-between items-center bg-[#111827] p-4 rounded-xl border border-gray-800">
                <span className="text-gray-400">متوسط الدرجات</span>
                <span className="text-green-400 font-bold">{statsData.avgScore}</span>
              </div>
            </div>
            <button onClick={() => setIsStatsModalOpen(false)} className="mt-6 w-full rounded-xl bg-gray-800 py-3 font-bold text-white hover:bg-gray-700 transition-colors">
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Quick Contact Modal */}
      {contactStudentInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-[#111827] border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <button onClick={() => setContactStudentInfo(null)} className="absolute top-4 left-4 p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-10">
              <X className="h-5 w-5" />
            </button>
            <div className="p-6 pb-0 flex flex-col items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 text-3xl font-bold text-indigo-300 mb-4">
                {contactStudentInfo.full_name.charAt(0)}
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">{contactStudentInfo.full_name}</h2>
              <p className="text-gray-400 text-sm">{groups.find(g => g.id === contactStudentInfo.group_id)?.name || 'بدون مجموعة'}</p>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="bg-[#1f2937] p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400 mb-1">رقم الطالب</p>
                  <p className="text-white font-medium dir-ltr text-right">{contactStudentInfo.student_phone || 'غير مسجل'}</p>
                </div>
                {contactStudentInfo.student_phone && (
                  <a href={`tel:${contactStudentInfo.student_phone}`} className="flex items-center gap-2 rounded-lg bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/20 transition-colors border border-indigo-500/20">
                    <Phone className="w-4 h-4" /> اتصال
                  </a>
                )}
              </div>
              <div className="bg-[#1f2937] p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400 mb-1">رقم ولي الأمر</p>
                  <p className="text-white font-medium dir-ltr text-right">{contactStudentInfo.parent_phone || 'غير مسجل'}</p>
                </div>
                {contactStudentInfo.parent_phone && (
                  <a href={`tel:${contactStudentInfo.parent_phone}`} className="flex items-center gap-2 rounded-lg bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/20 transition-colors border border-indigo-500/20">
                    <Phone className="w-4 h-4" /> اتصال
                  </a>
                )}
              </div>
              <button 
                onClick={() => {
                  setContactStudentInfo(null);
                  setWhatsappStudent(contactStudentInfo);
                  setIsWhatsAppModalOpen(true);
                }} 
                className="w-full flex justify-center items-center gap-2 mt-4 rounded-xl bg-green-600 py-3.5 font-bold text-white hover:bg-green-700 transition-colors active:scale-95 shadow-lg shadow-green-500/20"
              >
                <MessageSquare className="w-5 h-5" /> إرسال تقرير عبر واتساب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced WhatsApp Modal */}
      {isWhatsAppModalOpen && whatsappStudent && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#111827] border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <button onClick={() => setIsWhatsAppModalOpen(false)} className="absolute top-4 left-4 p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-10">
              <X className="h-5 w-5" />
            </button>
            
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-400" /> تقرير واتساب
              </h2>
              <p className="text-gray-400 text-sm mt-1">إرسال تقرير للطالب {whatsappStudent.full_name}</p>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="flex bg-[#1f2937] p-1 rounded-xl border border-gray-700">
                <button
                  onClick={() => setWhatsappMode('system')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${whatsappMode === 'system' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'}`}
                >
                  رسالة النظام
                </button>
                <button
                  onClick={() => setWhatsappMode('custom')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${whatsappMode === 'custom' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'}`}
                >
                  قالبي
                </button>
              </div>

              {whatsappMode === 'custom' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex flex-wrap gap-2">
                    {['{اسم الطالب}', '{المجموعه}', '{المادة}', '{التاريخ}', '{اسم المعلم}'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setCustomWhatsappTemplate(prev => prev + ' ' + tag)}
                        className="px-2.5 py-1 text-xs font-medium bg-indigo-500/10 text-indigo-300 rounded-md border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={customWhatsappTemplate}
                    onChange={(e) => setCustomWhatsappTemplate(e.target.value)}
                    placeholder="اكتب قالب الرسالة هنا..."
                    className="w-full h-40 rounded-xl border border-gray-700 bg-[#1f2937] p-4 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    dir="rtl"
                  ></textarea>
                  <button
                    onClick={() => {
                      localStorage.setItem('whatsapp_custom_template', customWhatsappTemplate);
                      toast.success('تم حفظ القالب بنجاح');
                    }}
                    className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    حفظ القالب لهذا القسم
                  </button>
                </div>
              )}
              
              {whatsappMode === 'system' && (
                <div className="p-4 bg-[#1f2937] rounded-xl border border-gray-700 text-sm text-gray-300 leading-relaxed whitespace-pre-line animate-in fade-in">
                  ✨ تقرير الحضور والواجب والتسميع ✨<br/>
                  السلام عليكم ورحمة الله وبركاته 🌺<br/>
                  👤 الطالب: {whatsappStudent.full_name}<br/>
                  📚 المجموعة: {groups.find(g => g.id === whatsappStudent.group_id)?.name || 'غير محدد'}<br/>
                  ...
                </div>
              )}

              <div className="space-y-3 pt-4 border-t border-gray-800">
                <p className="text-sm font-medium text-gray-300">الإرسال من:</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={whatsappAppType === 'normal'} onChange={() => setWhatsappAppType('normal')} className="text-green-500 focus:ring-green-500 bg-gray-700 border-gray-600" />
                    <span className="text-sm text-gray-300">واتساب العادي</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={whatsappAppType === 'business'} onChange={() => setWhatsappAppType('business')} className="text-green-500 focus:ring-green-500 bg-gray-700 border-gray-600" />
                    <span className="text-sm text-gray-300">واتساب الأعمال</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#1f2937] border-t border-gray-800 flex gap-3">
              <button onClick={() => setIsWhatsAppModalOpen(false)} className="flex-1 rounded-xl bg-gray-800 py-3 font-bold text-white hover:bg-gray-700 transition-colors">
                إلغاء
              </button>
              <button 
                onClick={async () => {
                  const phone = whatsappStudent.parent_phone?.replace(/^0/, '20') || whatsappStudent.student_phone?.replace(/^0/, '20');
                  if (!phone) { toast.error('لا يوجد رقم هاتف مسجل'); return; }
                  
                  let finalMessage = '';
                  const group = groups.find(g => g.id === whatsappStudent.group_id);
                  
                  if (whatsappMode === 'system') {
                    const toastId = toast.loading('جاري تجهيز بيانات التقرير...');
                    try {
                      const [attRes, hwRes, recRes] = await Promise.all([
                        supabase.from('attendance').select('status').eq('student_id', whatsappStudent.id).order('date', { ascending: false }).limit(1),
                        supabase.from('homework').select('status').eq('student_id', whatsappStudent.id).order('date', { ascending: false }).limit(1),
                        supabase.from('recitation').select('grade').eq('student_id', whatsappStudent.id).order('date', { ascending: false }).limit(1)
                      ]);
                      const attStatus = attRes.data?.[0]?.status || 'غير مسجل';
                      const hwStatus = hwRes.data?.[0]?.status || 'غير مسجل';
                      const recGrade = recRes.data?.[0]?.grade || 'غير مسجل';
                      finalMessage = `✨ تقرير الحضور والواجب والتسميع ✨\nالسلام عليكم ورحمة الله وبركاته 🌺\n👤 الطالب: ${whatsappStudent.full_name}\n📚 المجموعة: ${group?.name || 'غير محدد'}\n📖 المادة: ${group?.subject || 'غير محدد'}\n📌 آخر متابعة:\n▪️ الحضور: ${attStatus}\n▪️ الواجب: ${hwStatus}\n▪️ التسميع: ${recGrade}\nمع تمنياتنا بالتوفيق والنجاح 🌸\n👨‍🏫 المعلم: إدارة المنصة`;
                      toast.dismiss(toastId);
                    } catch (e) {
                      toast.dismiss(toastId);
                      toast.error('حدث خطأ');
                      return;
                    }
                  } else {
                    if (!customWhatsappTemplate) { toast.error('القالب فارغ'); return; }
                    const today = new Date();
                    const dateStr = `${today.getFullYear()}/${today.getMonth()+1}/${today.getDate()}`;
                    finalMessage = customWhatsappTemplate
                      .replace(/{اسم الطالب}/g, whatsappStudent.full_name)
                      .replace(/{المجموعه}/g, group?.name || 'غير محدد')
                      .replace(/{المادة}/g, group?.subject || 'غير محدد')
                      .replace(/{التاريخ}/g, dateStr)
                      .replace(/{اسم المعلم}/g, 'معلمي');
                  }
                  
                  const encoded = encodeURIComponent(finalMessage);
                  const url = whatsappAppType === 'business' 
                    ? `whatsapp://send?phone=${phone}&text=${encoded}` 
                    : `https://wa.me/${phone}?text=${encoded}`;
                    
                  window.open(url, '_blank');
                  setIsWhatsAppModalOpen(false);
                }}
                className="flex-[2] rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" /> إرسال الرسالة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Data Modal */}
      {isClearDataModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-red-500/50 bg-[#111827] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-800 p-6 bg-red-500/10 rounded-t-2xl">
              <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
                <Trash2 className="h-6 w-6" /> تحذير: مسح كافة البيانات
              </h2>
              <button onClick={() => { setIsClearDataModalOpen(false); setClearConfirmText(""); }} className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-300">
                أنت على وشك <strong className="text-red-400">مسح جميع بياناتك</strong> بالكامل من النظام. هذا الإجراء يشمل الطلاب، المجموعات، سجلات الحضور، الحسابات المالية، الامتحانات والتسميع.
              </p>
              <p className="text-gray-300 font-bold">لا يمكن التراجع عن هذا الإجراء أبداً!</p>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">للتأكيد، يرجى كتابة كلمة <strong className="text-white">مسح</strong> في الحقل أدناه:</label>
                <input
                  type="text"
                  value={clearConfirmText}
                  onChange={(e) => setClearConfirmText(e.target.value)}
                  placeholder="مسح"
                  className="w-full rounded-xl border border-red-500/50 bg-[#0B1120] px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  dir="rtl"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-800 p-6 bg-[#0B1120]/50 rounded-b-2xl">
              <button onClick={() => { setIsClearDataModalOpen(false); setClearConfirmText(""); }} className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors">
                إلغاء
              </button>
              <button 
                onClick={handleClearData} 
                disabled={clearConfirmText !== "مسح"}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" /> تأكيد المسح النهائي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-gray-800 bg-[#0B1120]/95 backdrop-blur-xl px-2 pb-[env(safe-area-inset-bottom)] lg:hidden">
        {[
          { name: 'الرئيسية', icon: LayoutDashboard },
          { name: 'المجموعات', icon: Library },
          { name: 'الطلاب', icon: Users },
          { name: 'الجدول', icon: CalendarDays },
          ...((userRole === 'teacher' || userRole === 'super_admin') ? [{ name: 'المالية', icon: Wallet }] : []),
          { name: 'الملازم', icon: BookCheck }
        ].map((item) => {
          const isActive = activeTab === item.name;
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`flex flex-col items-center justify-center gap-1 min-w-[48px] h-full ${
                isActive ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className={`flex items-center justify-center rounded-lg p-1 transition-all ${isActive ? 'bg-indigo-500/15 text-indigo-400 shadow-sm shadow-indigo-500/10' : ''}`}>
                <Icon className={`h-5 w-5 ${isActive ? 'scale-105' : ''} transition-transform`} />
              </div>
              <span className={`text-[10px] leading-none font-medium transition-colors ${isActive ? 'text-indigo-400 font-bold' : 'text-gray-500'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}

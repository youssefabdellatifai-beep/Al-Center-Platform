import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Search, Plus, Trash2, Edit, Save, X, Activity, MessageCircle, MoreVertical, RefreshCw, Send, CheckCircle2, Phone, Calendar, UserCheck, ShieldAlert, CheckCircle, GraduationCap, Clock, AlertTriangle, MessageSquare, Heart, Check, Users, BookCheck, Wallet, DollarSign, Star, Crown, PhoneCall, User, BarChart } from 'lucide-react';
import { toast } from 'react-hot-toast';

export type Student = { id: string; full_name: string; group_id: string; student_phone?: string; parent_phone?: string; created_at: string; };

interface Group {
  id: string;
  subject: string;
  type: string;
  price: number;
  name?: string;
}

interface StudentsTabProps {
  isActive: boolean;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  isLoadingStudents: boolean;
  groups: Group[];
  teacherId: string;
  userRole: string;
  newStudent: any;
  setNewStudent: (student: any) => void;
  isAddStudentModalOpen: boolean;
  setIsAddStudentModalOpen: (isOpen: boolean) => void;
  selectedStudent: Student | null;
  setSelectedStudent: (student: Student | null) => void;
  editStudentForm: any;
  setEditStudentForm: (form: any) => void;
  isEditStudentModalOpen: boolean;
  setIsEditStudentModalOpen: (isOpen: boolean) => void;
  statsData: any;
  setStatsData: (data: any) => void;
  isStatsModalOpen: boolean;
  setIsStatsModalOpen: (isOpen: boolean) => void;
  handleWhatsAppReport: (student: Student, mode?: 'parent' | 'student' | 'system' | 'custom') => void;
  handleGenerateMonthlyReport: (student: Student) => void;
  handleDeleteStudent: (studentId: string) => void;
  formatTime12h: (timeStr: string) => string;
  payments: any[];
  setPayments: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function StudentsTab({
  isActive,
  students,
  setStudents,
  isLoadingStudents,
  groups,
  teacherId,
  userRole,
  newStudent,
  setNewStudent,
  isAddStudentModalOpen,
  setIsAddStudentModalOpen,
  selectedStudent,
  setSelectedStudent,
  editStudentForm,
  setEditStudentForm,
  isEditStudentModalOpen,
  setIsEditStudentModalOpen,
  statsData,
  setStatsData,
  isStatsModalOpen,
  setIsStatsModalOpen,
  handleWhatsAppReport,
  handleGenerateMonthlyReport,
  handleDeleteStudent,
  formatTime12h,
  payments,
  setPayments
}: StudentsTabProps) {
  const [activeStudentFilter, setActiveStudentFilter] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  const [studentProfileTab, setStudentProfileTab] = useState("الحضور");
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [recitationHistory, setRecitationHistory] = useState<any[]>([]);
  const [homeworkHistory, setHomeworkHistory] = useState<any[]>([]);
  const [examsHistory, setExamsHistory] = useState<any[]>([]);
  
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
  const [isSubmittingEditStudent, setIsSubmittingEditStudent] = useState(false);
  
  const [contactStudentInfo, setContactStudentInfo] = useState<Student | null>(null);
  
  const [whatsappStudent, setWhatsappStudent] = useState<Student | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsappMode, setWhatsappMode] = useState<'parent' | 'student' | 'system' | 'custom'>('parent');
  const [customWhatsappTemplate, setCustomWhatsappTemplate] = useState("");
  const [whatsappAppType, setWhatsappAppType] = useState<'regular' | 'business' | 'normal'>('regular');

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


  const handleOpenAdvancedWhatsapp = (student: Student, mode: 'parent' | 'student' | 'system' | 'custom') => {
    setWhatsappStudent(student);
    setWhatsappMode(mode);
    setWhatsappMessage('');
    setIsWhatsAppModalOpen(true);
  };

  const handleSendAdvancedWhatsapp = () => {
    if (!whatsappStudent || !whatsappMessage.trim()) return;
    
    const phone = whatsappMode === 'parent' ? whatsappStudent.parent_phone : whatsappStudent.student_phone;
    if (!phone) {
      toast.error(`رقم هاتف ${whatsappMode === 'parent' ? 'ولي الأمر' : 'الطالب'} غير متوفر`);
      return;
    }

    let encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setIsWhatsAppModalOpen(false);
  };

  const filteredStudents = students.filter(student => {
    const matchesFilter = activeStudentFilter === "الكل" || student.group_id === activeStudentFilter;
    const matchesSearch = !searchQuery ||
                          searchQuery === "" ||
                          student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.student_phone?.includes(searchQuery) ||
                          student.parent_phone?.includes(searchQuery);

    console.log(`[StudentsTab] Student: "${student.full_name}", searchQuery: "${searchQuery}", matchesSearch: ${matchesSearch}, matchesFilter: ${matchesFilter}`);

    return matchesFilter && matchesSearch;
  });

  console.log(`[StudentsTab] Total students: ${students.length}, Filtered: ${filteredStudents.length}, Search: "${searchQuery}", Filter: "${activeStudentFilter}"`);

  return (
    <>
      {isActive && (
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
                    value={searchQuery}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      console.log('[StudentsTab INPUT] onChange fired! Value:', newValue);
                      setSearchQuery(newValue);
                      console.log('[StudentsTab INPUT] setSearchQuery called with:', newValue);
                    }}
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
                  // Use the already filtered list that includes search query
                  const filteredStudentsList = filteredStudents;

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
                      {(() => {
                        console.log('[StudentsTab RENDER] About to render. Total students:', students.length, 'Filtered:', filteredStudentsList.length, 'Search:', searchQuery);
                        return filteredStudentsList.map(student => {
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
                      });
                      })()}
                    </div>
                  );
                })()}
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

      {/* Student Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-2xl border-0 sm:border border-gray-700 bg-[#0B1120] shadow-2xl flex flex-col max-h-[100vh] sm:max-h-[90vh] overflow-hidden">

            {/* Header Area */}
            <div className="relative bg-[#111827] border-b border-gray-800 px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6">
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
                <button onClick={() => setSelectedStudent(null)} className="rounded-full p-2 sm:p-2 bg-gray-800/80 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 sm:gap-6">
                <div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/30 text-3xl sm:text-4xl font-bold text-indigo-300 shadow-xl">
                  {selectedStudent.full_name.charAt(0)}
                </div>
                <div className="text-center sm:text-right flex-1 w-full">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{selectedStudent.full_name}</h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-3">
                    <span className="inline-flex items-center rounded-md bg-gray-800 px-2.5 py-1 text-xs sm:text-sm font-medium text-gray-300 border border-gray-700">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 opacity-50" />
                      {groups.find(g => g.id === selectedStudent.group_id)?.name || 'غير محدد'}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-green-500/10 px-2.5 py-1 text-xs sm:text-sm font-medium text-green-400 border border-green-500/20">
                      منتظم
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4 w-full">
                    {selectedStudent.student_phone && (
                      <a href={`tel:${selectedStudent.student_phone}`} className="flex items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-3 min-h-[48px] text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors border border-gray-700 active:scale-95">
                        <PhoneCall className="h-4 w-4 text-indigo-400" />
                        <span className="text-xs sm:text-sm">الطالب</span>
                      </a>
                    )}
                    {selectedStudent.parent_phone && (
                      <a href={`tel:${selectedStudent.parent_phone}`} className="flex items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-3 min-h-[48px] text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors border border-gray-700 active:scale-95">
                        <PhoneCall className="h-4 w-4 text-purple-400" />
                        <span className="text-xs sm:text-sm">ولي الأمر</span>
                      </a>
                    )}
                    <button onClick={() => handleWhatsAppReport(selectedStudent)} className="flex items-center justify-center gap-2 rounded-lg bg-green-500/10 px-3 py-3 min-h-[48px] text-sm font-medium text-green-400 hover:bg-green-500/20 transition-colors border border-green-500/20 active:scale-95">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">تقرير</span>
                    </button>
                    <button onClick={() => handleGenerateMonthlyReport(selectedStudent)} className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366]/10 px-3 py-3 min-h-[48px] text-sm font-medium text-[#25D366] hover:bg-[#25D366]/20 transition-colors border border-[#25D366]/20 active:scale-95">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">شهري</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-800 bg-[#111827] px-2 sm:px-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
              {['الحضور', 'الواجب', 'التسميع', 'الدفع', 'الامتحانات']
                .filter(tab => !(userRole === 'assistant' && tab === 'الدفع'))
                .map(tab => (
                <button
                  key={tab}
                  onClick={() => setStudentProfileTab(tab)}
                  className={`snap-center shrink-0 whitespace-nowrap px-4 sm:px-6 py-4 sm:py-4 text-sm sm:text-sm font-bold transition-all border-b-2 min-h-[52px] ${
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
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0B1120] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              
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

    </>
  );
}

const fs = require('fs');

const lines = fs.readFileSync('src/app/page.tsx', 'utf8').split(/\r?\n/);

function extractBlock(startStr, endStr, startOffset = 0, endOffset = 0, exactEndMatch = false) {
  const startIdx = lines.findIndex(l => l.includes(startStr));
  if (startIdx === -1) throw new Error("Could not find start: " + startStr);
  const endIdx = lines.findIndex((l, i) => i > startIdx && (exactEndMatch ? l === endStr : l.includes(endStr)));
  if (endIdx === -1) throw new Error("Could not find end: " + endStr);
  return lines.slice(startIdx + startOffset, endIdx + endOffset + 1).join('\n');
}

const handleAddStudent = extractBlock('const handleAddStudent = async () => {', '  };', 0, 0, true);
const handleEditStudentSave = extractBlock('const handleEditStudentSave = async () => {', '  };', 0, 0, true);
const handlePrintCertificate = extractBlock('const handlePrintCertificate = (student: Student, exam: any) => {', '  };', 0, 0, true);
const handleSaveHomework = extractBlock('const handleSaveHomework = async () => {', '  };', 0, 0, true);
const handleSavePayment = extractBlock('const handleSavePayment = async (statusOverride?: string) => {', '  };', 0, 0, true);
const handleSaveExam = extractBlock('const handleSaveExam = async () => {', '  };', 0, 0, true);
const handleExamWhatsAppReport = extractBlock('const handleExamWhatsAppReport = (exam: any) => {', '  };', 0, 0, true);
const handleSaveAttendance = extractBlock('const handleSaveAttendance = async () => {', '  };', 0, 0, true);
const handleSaveRecitation = extractBlock('const handleSaveRecitation = async () => {', '  };', 0, 0, true);

const studentsUi = extractBlock('activeTab === "الطلاب" ? (', ') : activeTab === "باقات معلمي" ? (', 1, -1);

const addStudentModal = extractBlock('{/* Add Standard Student Modal */}', '{/* Private Student Modal */}', 0, -1);
const studentProfileModal = extractBlock('{/* Student Profile Modal */}', '{/* Edit Student Modal */}', 0, -1);
const editStudentModal = extractBlock('{/* Edit Student Modal */}', '{/* Stats Dummy Modal */}', 0, -1);
const statsModal = extractBlock('{/* Stats Dummy Modal */}', '{/* Quick Contact Modal */}', 0, -1);
const quickContactModal = extractBlock('{/* Quick Contact Modal */}', '{/* Advanced WhatsApp Modal */}', 0, -1);
const advancedWhatsappModal = extractBlock('{/* Advanced WhatsApp Modal */}', '{/* Clear Data Modal */}', 0, -1);

const componentCode = `import React, { useState } from 'react';
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
      month: \`\${today.getFullYear()}-\${String(today.getMonth() + 1).padStart(2, '0')}\`, 
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

${handleAddStudent}
${handleEditStudentSave}
${handlePrintCertificate}
${handleSaveHomework}
${handleSavePayment}
${handleSaveExam}
${handleExamWhatsAppReport}
${handleSaveAttendance}
${handleSaveRecitation}


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
      toast.error(\`رقم هاتف \${whatsappMode === 'parent' ? 'ولي الأمر' : 'الطالب'} غير متوفر\`);
      return;
    }

    let encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = \`https://wa.me/\${phone}?text=\${encodedMessage}\`;
    window.open(whatsappUrl, '_blank');
    setIsWhatsAppModalOpen(false);
  };

  const filteredStudents = students.filter(student => {
    const matchesFilter = activeStudentFilter === "الكل" || student.group_id === activeStudentFilter;
    const matchesSearch = student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.student_phone?.includes(searchQuery) ||
                          student.parent_phone?.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  return (
    <>
      {isActive && (
${studentsUi}
      )}
${addStudentModal}
${studentProfileModal}
${editStudentModal}
${statsModal}
${quickContactModal}
${advancedWhatsappModal}
    </>
  );
}
`;

fs.writeFileSync('src/components/students/StudentsTab.tsx', componentCode, 'utf8');
console.log('StudentsTab.tsx successfully generated.');

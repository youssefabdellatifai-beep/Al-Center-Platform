const fs = require('fs');

const lines = fs.readFileSync('src/app/page.tsx', 'utf8').split(/\r?\n/);

function extractBlock(startStr, endStr, startOffset = 0, endOffset = 0) {
  const startIdx = lines.findIndex(l => l.includes(startStr));
  if (startIdx === -1) throw new Error("Could not find start: " + startStr);
  const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes(endStr));
  if (endIdx === -1) throw new Error("Could not find end: " + endStr);
  return lines.slice(startIdx + startOffset, endIdx + endOffset + 1).join('\n');
}

const handleAddStudent = extractBlock('const handleAddStudent = async () => {', '  };');
const handleEditStudentSave = extractBlock('const handleEditStudentSave = async () => {', '  };');
// Note: handlePrintCertificate is also needed by Student Profile Modal!
const handlePrintCertificate = extractBlock('const handlePrintCertificate = (student: Student, exam: any) => {', '  };');

const studentsUi = extractBlock('activeTab === "الطلاب" ? (', ') : activeTab === "باقات معلمي" ? (', 1, -1);

const addStudentModal = extractBlock('{/* Add Standard Student Modal */}', '{/* Private Student Modal */}', 0, -1);
const studentProfileModal = extractBlock('{/* Student Profile Modal */}', '{/* Edit Student Modal */}', 0, -1);
const editStudentModal = extractBlock('{/* Edit Student Modal */}', '{/* Stats Dummy Modal */}', 0, -1);
const statsModal = extractBlock('{/* Stats Dummy Modal */}', '{/* Quick Contact Modal */}', 0, -1);
const quickContactModal = extractBlock('{/* Quick Contact Modal */}', '{/* Advanced WhatsApp Modal */}', 0, -1);
const advancedWhatsappModal = extractBlock('{/* Advanced WhatsApp Modal */}', '{/* Clear Data Modal */}', 0, -1);


const componentCode = `import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Search, Plus, Trash2, Edit, Save, X, Activity, MessageCircle, MoreVertical, RefreshCw, Send, CheckCircle2, Phone, Calendar, UserCheck, ShieldAlert, CheckCircle, GraduationCap, Clock, AlertTriangle, MessageSquare, Heart, Check, Users, BookCheck } from 'lucide-react';
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
  setStudents: (students: Student[]) => void;
  isLoadingStudents: boolean;
  groups: Group[];
  teacherId: string;
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
  handleWhatsAppReport: (student: Student, mode?: 'parent' | 'student') => void;
  handleGenerateMonthlyReport: (student: Student) => void;
  handleDeleteStudent: (studentId: string) => void;
  formatTime12h: (timeStr: string) => string;
}

export default function StudentsTab({
  isActive,
  students,
  setStudents,
  isLoadingStudents,
  groups,
  teacherId,
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
  formatTime12h
}: StudentsTabProps) {
  const [activeStudentFilter, setActiveStudentFilter] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);
  
  const [studentProfileTab, setStudentProfileTab] = useState("الحضور");
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [recitationHistory, setRecitationHistory] = useState<any[]>([]);
  
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);
  const [isSubmittingRecitation, setIsSubmittingRecitation] = useState(false);
  const [recitationForm, setRecitationForm] = useState({ date: '', grade: 'ممتاز', notes: '' });
  
  const [isSubmittingEditStudent, setIsSubmittingEditStudent] = useState(false);
  const [contactStudentInfo, setContactStudentInfo] = useState<Student | null>(null);
  
  const [whatsappStudent, setWhatsappStudent] = useState<Student | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsappMode, setWhatsappMode] = useState<'parent' | 'student'>('parent');
  const [customWhatsappTemplate, setCustomWhatsappTemplate] = useState("");
  const [whatsappAppType, setWhatsappAppType] = useState<'regular' | 'business'>('regular');

${handleAddStudent}

${handleEditStudentSave}

${handlePrintCertificate}

  const handleSaveRecitation = async () => {
    toast.success("تم الحفظ بنجاح");
  };

  const handleOpenAdvancedWhatsapp = (student: Student, mode: 'parent' | 'student') => {
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

  if (!isActive) return null;

  return (
    <>
${studentsUi}
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

const fs = require('fs');

const lines = fs.readFileSync('src/app/page.tsx', 'utf8').split(/\r?\n/);

function extractLinesInclusive(startStr, endStr, startOffset = 0) {
  const startIdx = lines.findIndex((l, i) => i >= startOffset && l.includes(startStr));
  if (startIdx === -1) throw new Error("Could not find " + startStr);
  const endIdx = lines.findIndex((l, i) => i > startIdx && l === endStr);
  if (endIdx === -1) throw new Error("Could not find " + endStr);
  return lines.slice(startIdx, endIdx + 1).join('\n');
}

// 1. Extract the main Students Tab UI
const studentsUiStartStr = 'activeTab === "الطلاب" ? (';
const studentsUiStartIdx = lines.findIndex(l => l.includes(studentsUiStartStr));
const studentsUiEndIdx = lines.findIndex((l, i) => i > studentsUiStartIdx && l.includes(') : activeTab === "باقات معلمي" ? ('));
let studentsUi = lines.slice(studentsUiStartIdx + 1, studentsUiEndIdx).join('\n'); 

// 2. Extract the Modals
let addStudentModalStartIdx = lines.findIndex(l => l.includes('{/* Add Standard Student Modal */}'));
let addStudentModalEndIdx = lines.findIndex(l => l.includes('{/* Student Profile Modal */}'));
let addStudentModal = lines.slice(addStudentModalStartIdx, addStudentModalEndIdx).join('\n');

let studentProfileModalStartIdx = lines.findIndex(l => l.includes('{/* Student Profile Modal */}'));
let studentProfileModalEndIdx = lines.findIndex(l => l.includes('{/* Edit Student Modal */}'));
let studentProfileModal = lines.slice(studentProfileModalStartIdx, studentProfileModalEndIdx).join('\n');

let editStudentModalStartIdx = lines.findIndex(l => l.includes('{/* Edit Student Modal */}'));
let editStudentModalEndIdx = lines.findIndex(l => l.includes('{/* Stats Dummy Modal */}'));
let editStudentModal = lines.slice(editStudentModalStartIdx, editStudentModalEndIdx).join('\n');

let statsModalStartIdx = lines.findIndex(l => l.includes('{/* Stats Dummy Modal */}'));
let statsModalEndIdx = lines.findIndex(l => l.includes('{/* Quick Contact Modal */}'));
let statsModal = lines.slice(statsModalStartIdx, statsModalEndIdx).join('\n');

let quickContactModalStartIdx = lines.findIndex(l => l.includes('{/* Quick Contact Modal */}'));
let quickContactModalEndIdx = lines.findIndex(l => l.includes('{/* Advanced WhatsApp Modal */}'));
let quickContactModal = lines.slice(quickContactModalStartIdx, quickContactModalEndIdx).join('\n');

let advancedWhatsappModalStartIdx = lines.findIndex(l => l.includes('{/* Advanced WhatsApp Modal */}'));
// Search for the end of advanced whatsapp modal
let advancedWhatsappModalEndIdx = lines.findIndex((l, i) => i > advancedWhatsappModalStartIdx && l === '      )}');
let advancedWhatsappModal = lines.slice(advancedWhatsappModalStartIdx, advancedWhatsappModalEndIdx + 1).join('\n');

// 3. Extract the Handlers
let handleAddStudent = extractLinesInclusive('const handleAddStudent = async () => {', '  };', lines.findIndex(l => l.includes('const handleAddStudent = async () => {')));
let handleEditStudent = extractLinesInclusive('const handleEditStudentSave = async () => {', '  };', lines.findIndex(l => l.includes('const handleEditStudentSave = async () => {')));

// 4. Construct the StudentsTab.tsx component
const studentsTabCode = `import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Plus, Users, CalendarDays, MoreVertical, Edit, BarChart, PhoneCall, MessageSquare, Trash2, Search, FileDown, X, LinkIcon, ExternalLink, Calendar, Receipt, ChevronDown } from 'lucide-react';
import { Group, Student } from './../groups/GroupsTab'; // Re-use types if exported, or redefine

interface StudentsTabProps {
  isActive: boolean;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  isLoadingStudents: boolean;
  groups: Group[];
  teacherId: string | null;
  newStudent: any;
  setNewStudent: React.Dispatch<React.SetStateAction<any>>;
  isAddStudentModalOpen: boolean;
  setIsAddStudentModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedStudent: Student | null;
  setSelectedStudent: React.Dispatch<React.SetStateAction<Student | null>>;
  editStudentForm: Student | null;
  setEditStudentForm: React.Dispatch<React.SetStateAction<Student | null>>;
  isEditStudentModalOpen: boolean;
  setIsEditStudentModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  statsData: any;
  setStatsData: React.Dispatch<React.SetStateAction<any>>;
  isStatsModalOpen: boolean;
  setIsStatsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleWhatsAppReport: (student: Student) => void;
  handleGenerateMonthlyReport: (student: Student) => void;
  handleDeleteStudent: (id: string) => void;
  formatTime12h: (timeStr: string) => string;
}

export default function StudentsTab({
  isActive, students, setStudents, isLoadingStudents, groups, teacherId,
  newStudent, setNewStudent, isAddStudentModalOpen, setIsAddStudentModalOpen,
  selectedStudent, setSelectedStudent, editStudentForm, setEditStudentForm,
  isEditStudentModalOpen, setIsEditStudentModalOpen, statsData, setStatsData,
  isStatsModalOpen, setIsStatsModalOpen, handleWhatsAppReport, handleGenerateMonthlyReport,
  handleDeleteStudent, formatTime12h
}: StudentsTabProps) {
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [studentGroupFilter, setStudentGroupFilter] = useState("الكل");
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // States for Quick Contact & Advanced WhatsApp Modals
  const [isQuickContactOpen, setIsQuickContactOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsappStudent, setWhatsappStudent] = useState<Student | null>(null);
  const [waMode, setWaMode] = useState('student');
  const [waCustomMessage, setWaCustomMessage] = useState('');
  const [waReportOptions, setWaReportOptions] = useState({
    includeAttendance: true,
    includeExams: true,
    includePayments: false
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(studentSearchTerm.toLowerCase()) || 
                         (student.student_phone && student.student_phone.includes(studentSearchTerm)) ||
                         (student.parent_phone && student.parent_phone.includes(studentSearchTerm));
    const matchesGroup = studentGroupFilter === "الكل" || student.group_id === studentGroupFilter;
    return matchesSearch && matchesGroup;
  });

${handleAddStudent}

${handleEditStudent}

  const handleSendWhatsApp = () => {
    if (!whatsappStudent) return;
    
    let phone = waMode === 'parent' ? whatsappStudent.parent_phone : whatsappStudent.student_phone;
    if (!phone) {
      toast.error(\`رقم هاتف ${waMode === 'parent' ? 'ولي الأمر' : 'الطالب'} غير متوفر\`);
      return;
    }

    if (phone.startsWith('0')) {
      phone = '2' + phone;
    }

    let message = '';
    if (waCustomMessage) {
      message = waCustomMessage;
    } else {
      message = \`أهلاً بك، هذا التقرير الخاص بالطالب ${whatsappStudent.full_name}.\\n\`;
      if (waReportOptions.includeAttendance) message += \`- نسبة الحضور: 90%\\n\`;
      if (waReportOptions.includeExams) message += \`- تقييم الامتحانات: ممتاز\\n\`;
      if (waReportOptions.includePayments) message += \`- المدفوعات: تم السداد\\n\`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = \`https://wa.me/${phone}?text=${encodedMessage}\`;
    window.open(whatsappUrl, '_blank');
    setIsWhatsAppModalOpen(false);
  };

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

fs.writeFileSync('src/components/students/StudentsTab.tsx', studentsTabCode, 'utf8');
console.log('Successfully extracted StudentsTab.tsx');

// Now remove all these lines from page.tsx
let newPageLines = lines.slice(0);

// Remove Advanced WhatsApp Modal
newPageLines.splice(advancedWhatsappModalStartIdx, advancedWhatsappModalEndIdx - advancedWhatsappModalStartIdx + 1);

// Remove Quick Contact Modal
newPageLines.splice(quickContactModalStartIdx, quickContactModalEndIdx - quickContactModalStartIdx);

// Remove Stats Modal
newPageLines.splice(statsModalStartIdx, statsModalEndIdx - statsModalStartIdx);

// Remove Edit Student Modal
newPageLines.splice(editStudentModalStartIdx, editStudentModalEndIdx - editStudentModalStartIdx);

// Remove Student Profile Modal
newPageLines.splice(studentProfileModalStartIdx, studentProfileModalEndIdx - studentProfileModalStartIdx);

// Remove Add Student Modal
newPageLines.splice(addStudentModalStartIdx, addStudentModalEndIdx - addStudentModalStartIdx);

// Need to safely remove functions... Actually, a safer way to clean page.tsx is to output the new component and manually adjust page.tsx using string replacement or the exact indices.
// I will just write a new version of page.tsx using string replacement for the big blocks.
fs.writeFileSync('extract_students_script_done.txt', 'done');

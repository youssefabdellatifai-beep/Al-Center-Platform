import fs from 'fs';

const groupsUI = fs.readFileSync('groups_ui.tsx', 'utf-8');
const groupModal = fs.readFileSync('group_modal.tsx', 'utf-8');
const privateModal = fs.readFileSync('private_modal.tsx', 'utf-8');
const handleAddGroup = fs.readFileSync('handle_add_group.tsx', 'utf-8');
const handleDelete = fs.readFileSync('handle_delete.tsx', 'utf-8');

const componentContent = `
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Plus, Users, CalendarDays, MoreVertical, Edit, BarChart, PhoneCall, MessageSquare, Trash2, Search, FileDown, X, LinkIcon } from 'lucide-react';

export type Group = { id: string; name: string; subject: string; type: string; price: number; whatsapp_link?: string; created_at: string; schedules?: {day: string, time: string}[] };
export type Student = { id: string; full_name: string; group_id: string; student_phone?: string; parent_phone?: string; created_at: string; };

interface GroupsTabProps {
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  isLoadingGroups: boolean;
  students: Student[];
  teacherId: string | null;
  newStudent: any;
  setNewStudent: React.Dispatch<React.SetStateAction<any>>;
  setIsAddStudentModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedStudent: React.Dispatch<React.SetStateAction<Student | null>>;
  handleWhatsAppReport: (student: Student) => void;
  handleGenerateMonthlyReport: (student: Student) => void;
  handleDeleteStudent: (id: string) => void;
  setEditStudentForm: React.Dispatch<React.SetStateAction<Student | null>>;
  setIsEditStudentModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setStatsData: React.Dispatch<React.SetStateAction<any>>;
  setIsStatsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  formatTime12h: (timeStr: string) => string;
}

export default function GroupsTab({
  groups,
  setGroups,
  isLoadingGroups,
  students,
  teacherId,
  newStudent,
  setNewStudent,
  setIsAddStudentModalOpen,
  setSelectedStudent,
  handleWhatsAppReport,
  handleGenerateMonthlyReport,
  handleDeleteStudent,
  setEditStudentForm,
  setIsEditStudentModalOpen,
  setStatsData,
  setIsStatsModalOpen,
  formatTime12h
}: GroupsTabProps) {

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isPrivateModalOpen, setIsPrivateModalOpen] = useState(false);
  const [activeGroupFilter, setActiveGroupFilter] = useState("الكل");
  const [selectedGroupView, setSelectedGroupView] = useState<Group | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [newGroup, setNewGroup] = useState({ name: '', subject: '', type: 'center', price: '', whatsapp_link: '' });
  const [newGroupSchedules, setNewGroupSchedules] = useState<{day: string, time: string}[]>([]);
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const [newPrivateStudent, setNewPrivateStudent] = useState({
    full_name: '', student_phone: '', parent_phone: '', subject: '', payment_method: 'دفع شهري', price: '', start_date: ''
  });
  const [privateSchedules, setPrivateSchedules] = useState<{day: string, time: string}[]>([]);
  const [isSubmittingPrivate, setIsSubmittingPrivate] = useState(false);

  const getFilterCount = (filter: string) => {
    if (filter === "الكل") return groups.length;
    if (filter === "أونلاين") return groups.filter(g => g.type === "online").length;
    if (filter === "السنتر") return groups.filter(g => g.type === "center").length;
    if (filter === "م.ج برايفت") return groups.filter(g => g.type === "private_group").length;
    if (filter === "طالب برايفت") return groups.filter(g => g.type === "private_student").length;
    return 0;
  };

  const filteredGroups = groups.filter(group => {
    if (activeGroupFilter === "الكل") return true;
    if (activeGroupFilter === "أونلاين") return group.type === "online";
    if (activeGroupFilter === "السنتر") return group.type === "center";
    if (activeGroupFilter === "م.ج برايفت") return group.type === "private_group";
    if (activeGroupFilter === "طالب برايفت") return group.type === "private_student";
    return true;
  });

${handleAddGroup}

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setNewGroup({
      name: group.name,
      subject: group.subject || '',
      type: group.type || 'center',
      price: group.price ? group.price.toString() : '',
      whatsapp_link: group.whatsapp_link || ''
    });
    setNewGroupSchedules(group.schedules || []);
    setIsGroupModalOpen(true);
  };

  const handleDeleteGroup = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه المجموعة؟ جميع الطلاب والحصص المرتبطة بها ستتأثر.")) return;
    const { error } = await supabase.from('groups').delete().eq('id', id);
    if (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء الحذف");
    } else {
      toast.success("تم حذف المجموعة");
      setGroups(prev => prev.filter(g => g.id !== id));
      if (selectedGroupView?.id === id) setSelectedGroupView(null);
    }
  };

  const handleDownloadGroupReport = (group: Group) => {
    toast.success("جاري تحميل تقرير المجموعة...");
  };

  const handleAddPrivateStudent = async () => {
    if (!newPrivateStudent.full_name || !newPrivateStudent.price) {
      toast.error("يرجى ملء الحقول المطلوبة (الاسم والسعر)");
      return;
    }
    setIsSubmittingPrivate(true);
    
    // 1. Create a "private_student" group
    const groupPayload = {
      name: \`برايفت: \${newPrivateStudent.full_name}\`,
      subject: newPrivateStudent.subject || 'غير محدد',
      type: 'private_student',
      price: parseFloat(newPrivateStudent.price),
      schedules: privateSchedules
    };

    const { data: groupData, error: groupError } = await supabase.from('groups').insert([{ ...groupPayload, teacher_id: teacherId }]).select();
    
    if (groupError || !groupData) {
      console.error(groupError);
      toast.error("حدث خطأ أثناء إنشاء بيانات البرايفت");
      setIsSubmittingPrivate(false);
      return;
    }

    const newGroup = groupData[0];

    // 2. Create the student and link to the new group
    const { data: studentData, error: studentError } = await supabase.from('students').insert([{
      teacher_id: teacherId,
      group_id: newGroup.id,
      full_name: newPrivateStudent.full_name,
      student_phone: newPrivateStudent.student_phone,
      parent_phone: newPrivateStudent.parent_phone
    }]).select();

    setIsSubmittingPrivate(false);

    if (studentError) {
      console.error(studentError);
      toast.error("تم إنشاء المجموعة ولكن حدث خطأ في إضافة الطالب");
    } else {
      toast.success("تم إضافة الطالب البرايفت بنجاح");
      setGroups(prev => [newGroup, ...prev]);
      // Note: we can't update students directly here if the parent doesn't provide setStudents, 
      // but usually the parent relies on fetchStudents which happens automatically, 
      // or we just let it fetch.
      setIsPrivateModalOpen(false);
      setNewPrivateStudent({ full_name: '', student_phone: '', parent_phone: '', subject: '', payment_method: 'دفع شهري', price: '', start_date: '' });
      setPrivateSchedules([]);
    }
  };

  return (
    <>
${groupsUI}
${groupModal}
${privateModal}
    </>
  );
}
\`;

fs.mkdirSync('src/components/groups', { recursive: true });
fs.writeFileSync('src/components/groups/GroupsTab.tsx', componentContent);
console.log('Created GroupsTab.tsx successfully.');

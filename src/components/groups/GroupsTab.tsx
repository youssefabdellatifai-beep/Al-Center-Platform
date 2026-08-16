import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Plus, Users, CalendarDays, MoreVertical, Edit, BarChart, PhoneCall, MessageSquare, Trash2, Search, FileDown, X, LinkIcon, Phone } from 'lucide-react';

export type Group = { id: string; name: string; subject: string; type: string; price: number; whatsapp_link?: string; created_at: string; schedules?: { day: string; time: string }[] };
export type Student = { id: string; full_name: string; group_id: string; student_phone?: string; parent_phone?: string; created_at: string; };

interface GroupsTabProps {
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  isLoadingGroups: boolean;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
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
  groups, setGroups, isLoadingGroups, students, setStudents, teacherId, newStudent, setNewStudent, setIsAddStudentModalOpen, setSelectedStudent, handleWhatsAppReport, handleGenerateMonthlyReport, handleDeleteStudent, setEditStudentForm, setIsEditStudentModalOpen, setStatsData, setIsStatsModalOpen, formatTime12h
}: GroupsTabProps) {
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isPrivateModalOpen, setIsPrivateModalOpen] = useState(false);
  const [activeGroupFilter, setActiveGroupFilter] = useState("الكل");
  const [selectedGroupView, setSelectedGroupView] = useState<Group | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [newGroup, setNewGroup] = useState({ name: '', subject: '', type: 'center', price: '', whatsapp_link: '' });
  const [newGroupSchedules, setNewGroupSchedules] = useState<{day: string, time: string}[]>([]);
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

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

  const getFilterCount = (filter: string) => {
    if (filter === "الكل") return groups.length;
    if (filter === "أونلاين") return groups.filter(g => g.type === "online").length;
    if (filter === "السنتر") return groups.filter(g => g.type === "center").length;
    if (filter === "م.ج برايفت") return groups.filter(g => g.type === "private_group").length;
    if (filter === "طالب برايفت") return groups.filter(g => g.type === "private_student").length;
    return 0;
  };

  const filteredGroups = groups.filter(group => {
    // Filter by type/category
    const matchesFilter = activeGroupFilter === "الكل" ||
      (activeGroupFilter === "أونلاين" && group.type === "online") ||
      (activeGroupFilter === "السنتر" && group.type === "center") ||
      (activeGroupFilter === "م.ج برايفت" && group.type === "private_group") ||
      (activeGroupFilter === "طالب برايفت" && group.type === "private_student");

    // Filter by search query (only if search is not empty)
    const matchesSearch = !searchQuery ||
      searchQuery === "" ||
      group.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.subject?.toLowerCase().includes(searchQuery.toLowerCase());

    console.log(`[GroupsTab] Group: "${group.name}", searchQuery: "${searchQuery}", matchesSearch: ${matchesSearch}, matchesFilter: ${matchesFilter}`);

    return matchesFilter && matchesSearch;
  });

  console.log(`[GroupsTab] Total groups: ${groups.length}, Filtered: ${filteredGroups.length}, Search: "${searchQuery}", Filter: "${activeGroupFilter}"`);

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

  const handleDownloadGroupReport = (group: Group) => {
    toast.success("سيتم توفير هذه الميزة قريباً...");
  };

  return (
    <>
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
                      value={searchQuery}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        console.log('[GroupsTab INPUT] onChange fired! Value:', newValue);
                        setSearchQuery(newValue);
                        console.log('[GroupsTab INPUT] setSearchQuery called with:', newValue);
                      }}
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
                    {(() => {
                      console.log('[GroupsTab RENDER] About to render. Total groups:', groups.length, 'Filtered:', filteredGroups.length, 'Search:', searchQuery);
                      return filteredGroups.map(group => (
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
                    ));
                    })()}
                  </div>
                )}
                  </>
                )}
              </div>

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

    </>
  );
}

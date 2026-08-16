import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Crown, UserCircle, Plus, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';

export interface PreAuthorizedAssistant {
  id: string;
  name: string;
  phone: string;
  teacher_id: string;
  created_at: string;
}

interface AssistantsTabProps {
  isActive: boolean;
  teacherId: string;
  userRole: string;
  getCleanPhone: (phone: string) => string;
}

export default function AssistantsTab({
  isActive,
  teacherId,
  userRole,
  getCleanPhone
}: AssistantsTabProps) {
  const [preAuthorizedAssistants, setPreAuthorizedAssistants] = useState<PreAuthorizedAssistant[]>([]);
  const [assistantForm, setAssistantForm] = useState({ name: '', phone: '' });
  const [isSubmittingAssistant, setIsSubmittingAssistant] = useState(false);
  const [isLoadingAssistants, setIsLoadingAssistants] = useState(true);

    // Fetch Pre-Authorized Assistants
    useEffect(() => {
      if (!teacherId || (userRole !== 'teacher' && userRole !== 'super_admin')) {
        setIsLoadingAssistants(false);
        return;
      }
      const fetchAssistants = async () => {
        setIsLoadingAssistants(true);
        try {
          const { data, error } = await supabase
            .from('pre_authorized_assistants')
            .select('*')
            .eq('teacher_id', teacherId.replace(/"/g, ''))
            .order('created_at', { ascending: false });
            
          if (error && error.code !== '42P01') { 
            console.error("فشل في تحميل المساعدين", error);
          } else {
            setPreAuthorizedAssistants(data || []);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoadingAssistants(false);
        }
      };
      fetchAssistants();
    }, [teacherId, userRole]);

  if (!isActive) return null;

  return (
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
                      
                      try {
                        const { data, error } = await supabase.from('pre_authorized_assistants').insert([{
                          teacher_id: teacherId.replace(/"/g, ''),
                          name: assistantForm.name,
                          phone: cleanPhone
                        }]).select();
                        
                        if(error) throw error;
                        
                        toast.success("تم إضافة المساعد بنجاح");
                        setAssistantForm({ name: '', phone: '' });
                        if(data) setPreAuthorizedAssistants(prev => [data[0], ...prev]);
                      } catch (error) {
                        toast.error("حدث خطأ أثناء إضافة المساعد");
                        console.error(error);
                      } finally {
                        setIsSubmittingAssistant(false);
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
                                        try {
                                          const { error } = await supabase.from('pre_authorized_assistants').delete().eq('id', assistant.id);
                                          if (error) throw error;
                                          toast.success('تم الحذف');
                                          setPreAuthorizedAssistants(prev => prev.filter(a => a.id !== assistant.id));
                                        } catch (error) {
                                          toast.error('حدث خطأ أثناء الحذف');
                                          console.error(error);
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
  );
}

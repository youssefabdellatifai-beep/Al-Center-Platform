import React, { useState } from 'react';
import { BookCheck, CheckCircle, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';

export interface Group {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  full_name: string;
  group_id: string;
  student_phone?: string;
  parent_phone?: string;
  created_at: string;
}

export interface Material {
  id: string;
  name: string;
  group_id: string;
  cost: number;
  price: number;
  created_at: string;
}

export interface MaterialDistribution {
  id: string;
  material_id: string;
  student_id: string;
  status: 'تم التسليم' | 'لم يستلم';
  created_at: string;
}

interface MaterialsTabProps {
  isActive: boolean;
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
  materialDistributions: MaterialDistribution[];
  setMaterialDistributions: React.Dispatch<React.SetStateAction<MaterialDistribution[]>>;
  isLoadingMaterials: boolean;
  groups: Group[];
  students: Student[];
  teacherId: string;
}

export default function MaterialsTab({
  isActive,
  materials,
  setMaterials,
  materialDistributions,
  setMaterialDistributions,
  isLoadingMaterials,
  groups,
  students,
  teacherId
}: MaterialsTabProps) {
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

  if (!isActive) return null;

  return (
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
  );
}

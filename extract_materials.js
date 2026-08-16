const fs = require('fs');

const lines = fs.readFileSync('src/app/page.tsx', 'utf8').split(/\r?\n/);

function extractBlock(startStr, endStr, exactEndMatch = false) {
  const startIdx = lines.findIndex(l => l.includes(startStr));
  if (startIdx === -1) throw new Error("Could not find start: " + startStr);
  const endIdx = lines.findIndex((l, i) => i > startIdx && (exactEndMatch ? l === endStr : l.includes(endStr)));
  if (endIdx === -1) throw new Error("Could not find end: " + endStr);
  return lines.slice(startIdx, endIdx + 1).join('\n');
}

const handleSaveMaterial = extractBlock('const handleSaveMaterial = async (e: React.FormEvent) => {', '  };', true);
const handleToggleMaterialDistribution = extractBlock('const handleToggleMaterialDistribution = async (materialId: string, studentId: string, isDelivered: boolean) => {', '  };', true);
const uiBlock = extractBlock('activeTab === "الملازم" ? (', ') : activeTab === "إدارة المساعدين" ? (');

const componentCode = `import React, { useState } from 'react';
import { BookCheck, CheckCircle, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export interface Group {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  name: string;
  group_id: string;
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
  is_delivered: boolean;
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

${handleSaveMaterial.split('\n').map(l => '  ' + l).join('\n')}

${handleToggleMaterialDistribution.split('\n').map(l => '  ' + l).join('\n')}

  if (!isActive) return null;

  return (
${uiBlock.split('\n').slice(1, -1).map(l => '  ' + l).join('\n')}
  );
}
`;

fs.writeFileSync('src/components/materials/MaterialsTab.tsx', componentCode, 'utf8');
console.log('MaterialsTab generated successfully!');

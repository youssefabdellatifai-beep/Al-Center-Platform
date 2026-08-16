const fs = require('fs');

const lines = fs.readFileSync('src/app/page.tsx', 'utf8').split(/\r?\n/);

function extractBlock(startStr, endStr, exactEndMatch = false) {
  const startIdx = lines.findIndex(l => l.includes(startStr));
  if (startIdx === -1) throw new Error("Could not find start: " + startStr);
  const endIdx = lines.findIndex((l, i) => i > startIdx && (exactEndMatch ? l === endStr : l.includes(endStr)));
  if (endIdx === -1) throw new Error("Could not find end: " + endStr);
  return lines.slice(startIdx, endIdx + 1).join('\n');
}

const uiBlock = extractBlock('activeTab === "إدارة المساعدين" ? (', ') : activeTab === "الطلاب" ? (');
const fetchAssistantsBlock = extractBlock('  // Fetch Pre-Authorized Assistants', '  }, [teacherId, userRole]);');

const componentCode = `import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Crown, UserCircle, Plus } from 'lucide-react';
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

${fetchAssistantsBlock.split('\n').map(l => '  ' + l).join('\n')}

  if (!isActive) return null;

  return (
${uiBlock.split('\n').slice(1, -1).map(l => '  ' + l).join('\n')}
  );
}
`;

fs.writeFileSync('src/components/assistants/AssistantsTab.tsx', componentCode, 'utf8');
console.log('AssistantsTab generated successfully!');

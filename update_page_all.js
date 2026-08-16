const fs = require('fs');

const lines = fs.readFileSync('src/app/page.tsx', 'utf8').split(/\r?\n/);

// --- GROUPS EXTRACTION ---
// 1. Remove states
const statesToRemove = [
  'const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);',
  'const [isPrivateModalOpen, setIsPrivateModalOpen] = useState(false);',
  'const [activeGroupFilter, setActiveGroupFilter] = useState("الكل");',
  'const [selectedGroupView, setSelectedGroupView] = useState<Group | null>(null);',
  'const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);',
  'const [newGroup, setNewGroup]',
  'const [newGroupSchedules, setNewGroupSchedules]',
  'const [isSubmittingGroup, setIsSubmittingGroup]',
  'const [editingGroup, setEditingGroup]',
  'const [newPrivateStudent, setNewPrivateStudent]',
  'const [privateSchedules, setPrivateSchedules]',
  'const [isSubmittingPrivate, setIsSubmittingPrivate]'
];

for (let i = 0; i < lines.length; i++) {
  if (statesToRemove.some(s => lines[i].includes(s))) {
    lines[i] = ''; // blank it out
  }
}

// 2. Remove Handlers
function blankOutFunction(startStr, endStr) {
  let inFunc = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(startStr)) inFunc = true;
    if (inFunc) {
      const line = lines[i];
      lines[i] = '';
      if (line === endStr) inFunc = false;
    }
  }
}

blankOutFunction('const handleAddGroup = async () => {', '  };');
blankOutFunction('const handleAddPrivateStudent = async () => {', '  };');
blankOutFunction('const handleAddStudent = async () => {', '  };');
blankOutFunction('const handleEditStudentSave = async () => {', '  };');

// 3. Remove Modals (Block removal)
function blankOutBlock(startStr, endStr) {
  const startIdx = lines.findIndex(l => l.includes(startStr));
  if (startIdx === -1) return;
  const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes(endStr));
  if (endIdx === -1) return;
  for (let i = startIdx; i < endIdx; i++) {
    lines[i] = '';
  }
}

blankOutBlock('{/* Group Modal */}', '{/* Private Student Modal */}');
blankOutBlock('{/* Private Student Modal */}', '{/* Add Standard Student Modal */}');

blankOutBlock('{/* Add Standard Student Modal */}', '{/* Student Profile Modal */}');
blankOutBlock('{/* Student Profile Modal */}', '{/* Edit Student Modal */}');
blankOutBlock('{/* Edit Student Modal */}', '{/* Stats Dummy Modal */}');
blankOutBlock('{/* Stats Dummy Modal */}', '{/* Quick Contact Modal */}');
blankOutBlock('{/* Quick Contact Modal */}', '{/* Advanced WhatsApp Modal */}');

const whatsappStart = lines.findIndex(l => l.includes('{/* Advanced WhatsApp Modal */}'));
if (whatsappStart !== -1) {
  const whatsappEnd = lines.findIndex((l, i) => i > whatsappStart && l === '      )}');
  for (let i = whatsappStart; i <= whatsappEnd; i++) {
    lines[i] = '';
  }
}

// 4. Replace Tab UIs
const groupsUiStart = lines.findIndex(l => l.includes('activeTab === "المجموعات" ? ('));
const groupsUiEnd = lines.findIndex((l, i) => i > groupsUiStart && l.includes(') : activeTab === "الجدول" ? ('));

if (groupsUiStart !== -1) {
  for (let i = groupsUiStart + 1; i < groupsUiEnd; i++) {
    lines[i] = '';
  }
  lines[groupsUiStart + 1] = `              <GroupsTab
                groups={groups}
                setGroups={setGroups}
                isLoadingGroups={isLoadingGroups}
                students={students}
                setStudents={setStudents}
                teacherId={teacherId}
                newStudent={newStudent}
                setNewStudent={setNewStudent}
                setIsAddStudentModalOpen={setIsAddStudentModalOpen}
                setSelectedStudent={setSelectedStudent}
                handleWhatsAppReport={handleWhatsAppReport}
                handleGenerateMonthlyReport={handleGenerateMonthlyReport}
                handleDeleteStudent={handleDeleteStudent}
                setEditStudentForm={setEditStudentForm}
                setIsEditStudentModalOpen={setIsEditStudentModalOpen}
                setStatsData={setStatsData}
                setIsStatsModalOpen={setIsStatsModalOpen}
                formatTime12h={formatTime12h}
              />`;
}

const studentsUiStart = lines.findIndex(l => l.includes('activeTab === "الطلاب" ? ('));
const studentsUiEnd = lines.findIndex((l, i) => i > studentsUiStart && l.includes(') : activeTab === "باقات معلمي" ? ('));

if (studentsUiStart !== -1) {
  for (let i = studentsUiStart + 1; i < studentsUiEnd; i++) {
    lines[i] = '';
  }
  lines[studentsUiStart + 1] = `              <></>`;
}

// Write the lines, filtering out blanks, or just joining them
let code = lines.filter(l => l !== '').join('\n');

// 5. Add Imports
code = code.replace(
  "import { supabase } from '@/lib/supabaseClient';",
  "import { supabase } from '@/lib/supabaseClient';\nimport GroupsTab from '@/components/groups/GroupsTab';\nimport StudentsTab from '@/components/students/StudentsTab';"
);

// 6. Add StudentsTab render at the end
code = code.replace(
  "{/* --- MODALS --- */}",
  `<StudentsTab
        isActive={activeTab === "الطلاب"}
        students={students}
        setStudents={setStudents}
        isLoadingStudents={isLoadingStudents}
        groups={groups}
        teacherId={teacherId}
        newStudent={newStudent}
        setNewStudent={setNewStudent}
        isAddStudentModalOpen={isAddStudentModalOpen}
        setIsAddStudentModalOpen={setIsAddStudentModalOpen}
        selectedStudent={selectedStudent}
        setSelectedStudent={setSelectedStudent}
        editStudentForm={editStudentForm}
        setEditStudentForm={setEditStudentForm}
        isEditStudentModalOpen={isEditStudentModalOpen}
        setIsEditStudentModalOpen={setIsEditStudentModalOpen}
        statsData={statsData}
        setStatsData={setStatsData}
        isStatsModalOpen={isStatsModalOpen}
        setIsStatsModalOpen={setIsStatsModalOpen}
        handleWhatsAppReport={handleWhatsAppReport}
        handleGenerateMonthlyReport={handleGenerateMonthlyReport}
        handleDeleteStudent={handleDeleteStudent}
        formatTime12h={formatTime12h}
      />\n\n      {/* --- MODALS --- */}`
);

fs.writeFileSync('src/app/page.tsx', code, 'utf8');
console.log('Successfully cleaned and updated page.tsx with BOTH GroupsTab and StudentsTab!');

const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf-8');

// 1. Add Import
content = content.replace("import { supabase } from '@/lib/supabaseClient';", "import { supabase } from '@/lib/supabaseClient';\nimport GroupsTab from '@/components/groups/GroupsTab';");

// 2. Remove states that moved to GroupsTab
content = content.replace(/const \[isGroupModalOpen, setIsGroupModalOpen\] = useState\(false\);\n/g, '');
content = content.replace(/const \[isPrivateModalOpen, setIsPrivateModalOpen\] = useState\(false\);\n/g, '');
content = content.replace(/const \[activeGroupFilter, setActiveGroupFilter\] = useState\("الكل"\);\n/g, '');
content = content.replace(/const \[selectedGroupView, setSelectedGroupView\] = useState<Group \| null>\(null\);\n/g, '');
content = content.replace(/const \[openDropdownId, setOpenDropdownId\] = useState<string \| null>\(null\);\n/g, '');

const stateRegex1 = /const \[newGroup, setNewGroup\].*;\n/g;
const stateRegex2 = /const \[newGroupSchedules, setNewGroupSchedules\].*;\n/g;
const stateRegex3 = /const \[isSubmittingGroup, setIsSubmittingGroup\].*;\n/g;
const stateRegex4 = /const \[editingGroup, setEditingGroup\].*;\n/g;
content = content.replace(stateRegex1, '');
content = content.replace(stateRegex2, '');
content = content.replace(stateRegex3, '');
content = content.replace(stateRegex4, '');

// Also Private Student state
const privateState1 = /const \[newPrivateStudent, setNewPrivateStudent\] = useState\(\{[\s\S]*?\}\);\n/g;
const privateState2 = /const \[privateSchedules, setPrivateSchedules\].*;\n/g;
const privateState3 = /const \[isSubmittingPrivate, setIsSubmittingPrivate\].*;\n/g;
content = content.replace(privateState1, '');
content = content.replace(privateState2, '');
content = content.replace(privateState3, '');

// 3. Remove handleAddGroup function
const handleAddGroupRegex = /const handleAddGroup = async \(\) => \{[\s\S]*?setNewGroupSchedules\(\[\]\);\n\s*\}\n\s*\}\n\s*};\n/g;
content = content.replace(handleAddGroupRegex, '');

// 4. Remove handleAddPrivateStudent function
const handleAddPrivateStudentRegex = /const handleAddPrivateStudent = async \(\) => \{[\s\S]*?setPrivateSchedules\(\[\]\);\n\s*\}\n\s*};\n/g;
content = content.replace(handleAddPrivateStudentRegex, '');

// 5. Replace Groups UI block with GroupsTab component
const groupsUIBlock = /activeTab === "المجموعات" \? \([\s\S]*?\) : activeTab === "الجدول" \? \(/g;
const newGroupsUI = `activeTab === "المجموعات" ? (
              <GroupsTab
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
              />
            ) : activeTab === "الجدول" ? (`
content = content.replace(groupsUIBlock, newGroupsUI);

// 6. Remove Group Modal
const groupModalRegex = /\{\/\* Group Modal \*\/\}\s*\{isGroupModalOpen && \([\s\S]*?\}\)\s*\}/g;
content = content.replace(groupModalRegex, '');

// 7. Remove Private Student Modal
const privateModalRegex = /\{\/\* Private Student Modal \*\/\}\s*\{isPrivateModalOpen && \([\s\S]*?\}\)\s*\}/g;
content = content.replace(privateModalRegex, '');

fs.writeFileSync('src/app/page.tsx', content);
console.log('Patched page.tsx successfully');

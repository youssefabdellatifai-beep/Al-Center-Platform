const fs = require('fs');

let lines = fs.readFileSync('src/app/page.tsx', 'utf8').split(/\r?\n/);

// add import
if (!lines.find(l => l.includes('import StudentsTab'))) {
  const imp = lines.findIndex(l => l.includes('import GroupsTab'));
  if (imp !== -1) {
    lines.splice(imp + 1, 0, "import StudentsTab from '@/components/students/StudentsTab';");
  } else {
    lines.splice(2, 0, "import StudentsTab from '@/components/students/StudentsTab';");
  }
}

function extractBlock(startStr, endStr, startOffset = 0, endOffset = 0, exactEndMatch = false) {
  const startIdx = lines.findIndex(l => l.includes(startStr));
  if (startIdx === -1) throw new Error("Could not find start: " + startStr);
  const endIdx = lines.findIndex((l, i) => i > startIdx && (exactEndMatch ? l === endStr : l.includes(endStr)));
  if (endIdx === -1) throw new Error("Could not find end: " + endStr);
  return { startIdx: startIdx + startOffset, endIdx: endIdx + endOffset };
}

function blankOutLines(block) {
  for (let i = block.startIdx; i <= block.endIdx; i++) {
    lines[i] = undefined;
  }
}

const blocksToBlankOut = [
  extractBlock('const handleAddStudent = async () => {', '  };', 0, 0, true),
  extractBlock('const handleEditStudentSave = async () => {', '  };', 0, 0, true),
  extractBlock('const handlePrintCertificate = (student: Student, exam: any) => {', '  };', 0, 0, true),
  extractBlock('const handleSaveHomework = async () => {', '  };', 0, 0, true),
  extractBlock('const handleSavePayment = async (statusOverride?: string) => {', '  };', 0, 0, true),
  extractBlock('const handleSaveExam = async () => {', '  };', 0, 0, true),
  extractBlock('const handleExamWhatsAppReport = (exam: any) => {', '  };', 0, 0, true),
  extractBlock('const handleSaveAttendance = async () => {', '  };', 0, 0, true),
  extractBlock('const handleSaveRecitation = async () => {', '  };', 0, 0, true),
  extractBlock('activeTab === "الطلاب" ? (', ') : activeTab === "باقات معلمي" ? (', 0, -1),
  extractBlock('{/* Add Standard Student Modal */}', '{/* Private Student Modal */}', 0, -1),
  extractBlock('{/* Student Profile Modal */}', '{/* Edit Student Modal */}', 0, -1),
  extractBlock('{/* Edit Student Modal */}', '{/* Stats Dummy Modal */}', 0, -1),
  extractBlock('{/* Stats Dummy Modal */}', '{/* Quick Contact Modal */}', 0, -1),
  extractBlock('{/* Quick Contact Modal */}', '{/* Advanced WhatsApp Modal */}', 0, -1),
  extractBlock('{/* Advanced WhatsApp Modal */}', '{/* Clear Data Modal */}', 0, -1)
];

const uiBlock = extractBlock('activeTab === "الطلاب" ? (', ') : activeTab === "باقات معلمي" ? (', 0, -1);
lines[uiBlock.startIdx] = `            ) : activeTab === "الطلاب" ? (
  <StudentsTab
    isActive={activeTab === "الطلاب"}
    students={students}
    setStudents={setStudents as any}
    isLoadingStudents={isLoadingStudents}
    groups={groups}
    teacherId={teacherId || ''}
    userRole={userRole || ''}
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
    payments={payments}
    setPayments={setPayments as any}
  />
`;

blocksToBlankOut.forEach((block, idx) => {
  if (idx !== 9) { // 9 is studentsUi
    blankOutLines(block);
  } else {
    for (let i = block.startIdx + 1; i <= block.endIdx; i++) {
      lines[i] = undefined;
    }
  }
});

const newContent = lines.filter(l => l !== undefined).join('\n');
fs.writeFileSync('src/app/page.tsx', newContent, 'utf8');
console.log('page.tsx successfully updated!');

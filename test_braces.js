const fs = require('fs');

const lines = fs.readFileSync('src/app/page.tsx', 'utf8').split(/\r?\n/);

function extractBlock(startStr, endStr, startOffset = 0, endOffset = 0, exactEndMatch = false) {
  const startIdx = lines.findIndex(l => l.includes(startStr));
  if (startIdx === -1) throw new Error("Could not find start: " + startStr);
  const endIdx = lines.findIndex((l, i) => i > startIdx && (exactEndMatch ? l === endStr : l.includes(endStr)));
  if (endIdx === -1) throw new Error("Could not find end: " + endStr);
  return lines.slice(startIdx + startOffset, endIdx + endOffset + 1).join('\n');
}

const blocks = {
  handleAddStudent: extractBlock('const handleAddStudent = async () => {', '  };', 0, 0, true),
  handleEditStudentSave: extractBlock('const handleEditStudentSave = async () => {', '  };', 0, 0, true),
  handlePrintCertificate: extractBlock('const handlePrintCertificate = (student: Student, exam: any) => {', '  };', 0, 0, true),
  handleSaveHomework: extractBlock('const handleSaveHomework = async () => {', '  };', 0, 0, true),
  handleSavePayment: extractBlock('const handleSavePayment = async (statusOverride?: string) => {', '  };', 0, 0, true),
  handleSaveExam: extractBlock('const handleSaveExam = async () => {', '  };', 0, 0, true),
  handleExamWhatsAppReport: extractBlock('const handleExamWhatsAppReport = (exam: any) => {', '  };', 0, 0, true),
  handleSaveAttendance: extractBlock('const handleSaveAttendance = async () => {', '  };', 0, 0, true),
  handleSaveRecitation: extractBlock('const handleSaveRecitation = async () => {', '  };', 0, 0, true),
  studentsUi: extractBlock('activeTab === "الطلاب" ? (', ') : activeTab === "باقات معلمي" ? (', 1, -1),
  addStudentModal: extractBlock('{/* Add Standard Student Modal */}', '{/* Private Student Modal */}', 0, -1),
  studentProfileModal: extractBlock('{/* Student Profile Modal */}', '{/* Edit Student Modal */}', 0, -1),
  editStudentModal: extractBlock('{/* Edit Student Modal */}', '{/* Stats Dummy Modal */}', 0, -1),
  statsModal: extractBlock('{/* Stats Dummy Modal */}', '{/* Quick Contact Modal */}', 0, -1),
  quickContactModal: extractBlock('{/* Quick Contact Modal */}', '{/* Advanced WhatsApp Modal */}', 0, -1),
  advancedWhatsappModal: extractBlock('{/* Advanced WhatsApp Modal */}', '{/* Clear Data Modal */}', 0, -1)
};

Object.entries(blocks).forEach(([name, content]) => {
  let b = 0, p = 0;
  let codeWithoutStrings = content.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '""');
  for(let i=0; i<codeWithoutStrings.length; i++) {
    if (codeWithoutStrings[i] === '{') b++;
    else if (codeWithoutStrings[i] === '}') b--;
    else if (codeWithoutStrings[i] === '(') p++;
    else if (codeWithoutStrings[i] === ')') p--;
  }
  if (b !== 0 || p !== 0) console.log(name, 'is unbalanced:', b, p);
});

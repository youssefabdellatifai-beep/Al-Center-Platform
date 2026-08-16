const fs = require('fs');

let lines = fs.readFileSync('src/app/page.tsx', 'utf8').split(/\r?\n/);

// add import
if (!lines.find(l => l.includes('import MaterialsTab'))) {
  const imp = lines.findIndex(l => l.includes('import StudentsTab'));
  if (imp !== -1) {
    lines.splice(imp + 1, 0, "import MaterialsTab from '@/components/materials/MaterialsTab';");
  } else {
    lines.splice(2, 0, "import MaterialsTab from '@/components/materials/MaterialsTab';");
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
  extractBlock('const handleSaveMaterial = async (e: React.FormEvent) => {', '  };', 0, 0, true),
  extractBlock('const handleToggleMaterialDistribution = async (materialId: string, studentId: string, isDelivered: boolean) => {', '  };', 0, 0, true)
];

const uiBlock = extractBlock('activeTab === "الملازم" ? (', ') : activeTab === "إدارة المساعدين" ? (', 0, -1);
lines[uiBlock.startIdx] = `            ) : activeTab === "الملازم" ? (
  <MaterialsTab
    isActive={activeTab === "الملازم"}
    materials={materials}
    setMaterials={setMaterials as any}
    materialDistributions={materialDistributions}
    setMaterialDistributions={setMaterialDistributions as any}
    isLoadingMaterials={isLoadingMaterials}
    groups={groups}
    students={students}
    teacherId={teacherId || ''}
  />
`;

blocksToBlankOut.forEach(block => blankOutLines(block));

// Blank out the UI block except the first line which we replaced
for (let i = uiBlock.startIdx + 1; i <= uiBlock.endIdx; i++) {
  lines[i] = undefined;
}

const newContent = lines.filter(l => l !== undefined).join('\n');
fs.writeFileSync('src/app/page.tsx', newContent, 'utf8');
console.log('page.tsx successfully updated for MaterialsTab!');

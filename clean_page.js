const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf-8');

// Fix state variable removal by making leading spaces optional
content = content.replace(/^\s*const \[isGroupModalOpen, setIsGroupModalOpen\] = useState\(false\);\n/gm, '');
content = content.replace(/^\s*const \[isPrivateModalOpen, setIsPrivateModalOpen\] = useState\(false\);\n/gm, '');
content = content.replace(/^\s*const \[activeGroupFilter, setActiveGroupFilter\] = useState\("الكل"\);\n/gm, '');
content = content.replace(/^\s*const \[selectedGroupView, setSelectedGroupView\] = useState<Group \| null>\(null\);\n/gm, '');
content = content.replace(/^\s*const \[openDropdownId, setOpenDropdownId\] = useState<string \| null>\(null\);\n/gm, '');

const stateRegex1 = /^\s*const \[newGroup, setNewGroup\].*;\n/gm;
const stateRegex2 = /^\s*const \[newGroupSchedules, setNewGroupSchedules\].*;\n/gm;
const stateRegex3 = /^\s*const \[isSubmittingGroup, setIsSubmittingGroup\].*;\n/gm;
const stateRegex4 = /^\s*const \[editingGroup, setEditingGroup\].*;\n/gm;
content = content.replace(stateRegex1, '');
content = content.replace(stateRegex2, '');
content = content.replace(stateRegex3, '');
content = content.replace(stateRegex4, '');

// Also Private Student state
const privateState1 = /^\s*const \[newPrivateStudent, setNewPrivateStudent\] = useState\(\{[\s\S]*?\}\);\n/gm;
const privateState2 = /^\s*const \[privateSchedules, setPrivateSchedules\].*;\n/gm;
const privateState3 = /^\s*const \[isSubmittingPrivate, setIsSubmittingPrivate\].*;\n/gm;
content = content.replace(privateState1, '');
content = content.replace(privateState2, '');
content = content.replace(privateState3, '');

// The Group Modal remnant starts with `       />` and ends right before `{/* Add Standard Student Modal */}`
// Wait, the remnant might be multiple lines. It's better to find it exactly.
const remnantStartIdx = content.indexOf('       />\n              </div>\n              <div className="grid grid-cols-2 gap-4">');
if (remnantStartIdx !== -1) {
  const nextModalIdx = content.indexOf('{/* Add Standard Student Modal */}', remnantStartIdx);
  if (nextModalIdx !== -1) {
    content = content.substring(0, remnantStartIdx) + content.substring(nextModalIdx);
  }
}

// Check Private Student Modal remnant.
const privateModalStr = '{/* Private Student Modal */}';
const editModalStr = '{/* Edit Student Modal */}';
const privateModalStartIdx = content.indexOf(privateModalStr);
if (privateModalStartIdx !== -1) {
  const editModalIdx = content.indexOf(editModalStr, privateModalStartIdx);
  if (editModalIdx !== -1) {
    content = content.substring(0, privateModalStartIdx) + content.substring(editModalIdx);
  } else {
    // If we can't find Edit modal, maybe just search for the end of the modal ')}'
  }
} else {
  // Maybe it was partially deleted.
  // The private modal remnant might start with `<div className="fixed inset-0 z-[60]`
  // Let's use string indexOf to manually find where Edit Student Modal is, and delete everything before it that is broken.
  // Wait, let's just do a manual repair of `page.tsx` using `fs.writeFileSync`.
}

fs.writeFileSync('src/app/page.tsx', content);
console.log('Cleaned up page.tsx state and modal remnants');

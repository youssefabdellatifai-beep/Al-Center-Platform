import fs from 'fs';

const pageContent = fs.readFileSync('src/app/page.tsx', 'utf-8');
const lines = pageContent.split('\n');

const uiStart = lines.findIndex(l => l.includes('activeTab === "المجموعات" ? ('));
const uiEnd = lines.findIndex((l, i) => i > uiStart && l.includes(') : activeTab === "الجدول" ? ('));

const groupModalStart = lines.findIndex(l => l.includes('{/* Group Modal */}'));
const groupModalEnd = lines.findIndex((l, i) => i > groupModalStart && l.includes('{/* Add Standard Student Modal */}'));

const privateModalStart = lines.findIndex(l => l.includes('{/* Private Student Modal */}'));
const privateModalEnd = lines.findIndex((l, i) => i > privateModalStart && l.includes('{/* Edit Student Modal */}'));

const handleAddGroupStart = lines.findIndex(l => l.includes('const handleAddGroup = async () => {'));
const handleAddGroupEnd = lines.findIndex((l, i) => i > handleAddGroupStart && l.includes('// MOUNTED GUARD: Bypass Hydration Mismatch'));

console.log({ uiStart, uiEnd, groupModalStart, groupModalEnd, privateModalStart, privateModalEnd, handleAddGroupStart, handleAddGroupEnd });

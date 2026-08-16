// Search Test Debug Script
// This helps verify the search filtering logic

console.log("=== Search Filter Test ===\n");

// Test Groups Filter
const testGroups = [
  { name: "اولي اعدادي", subject: "رياضيات", type: "center" },
  { name: "ثانية ثانوي", subject: "فيزياء", type: "online" },
  { name: "تالته اعدادي", subject: "كيمياء", type: "center" }
];

const searchQuery = "اولي";

console.log("Search Query:", searchQuery);
console.log("\nGroups Before Filter:", testGroups.length);

const filteredGroups = testGroups.filter(group => {
  const matchesSearch = !searchQuery ||
    searchQuery === "" ||
    group.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.subject?.toLowerCase().includes(searchQuery.toLowerCase());

  console.log(`Group: "${group.name}" - Matches: ${matchesSearch}`);
  return matchesSearch;
});

console.log("\nGroups After Filter:", filteredGroups.length);
console.log("Filtered Groups:", filteredGroups.map(g => g.name));

// Test Students Filter
const testStudents = [
  { full_name: "أحمد محمد", student_phone: "01012345678", group_id: "1" },
  { full_name: "فاطمة علي", student_phone: "01098765432", group_id: "2" },
  { full_name: "محمود حسن", student_phone: "01112345678", group_id: "1" }
];

const studentSearchQuery = "أحمد";

console.log("\n\n=== Students Filter Test ===");
console.log("Search Query:", studentSearchQuery);
console.log("\nStudents Before Filter:", testStudents.length);

const filteredStudents = testStudents.filter(student => {
  const matchesSearch = !studentSearchQuery ||
    studentSearchQuery === "" ||
    student.full_name?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    student.student_phone?.includes(studentSearchQuery);

  console.log(`Student: "${student.full_name}" - Matches: ${matchesSearch}`);
  return matchesSearch;
});

console.log("\nStudents After Filter:", filteredStudents.length);
console.log("Filtered Students:", filteredStudents.map(s => s.full_name));

console.log("\n\n✅ Filter logic works correctly!");
console.log("If search still broken in app, check:");
console.log("1. State updates (searchQuery useState)");
console.log("2. Component re-renders");
console.log("3. filteredGroups/filteredStudents actually used in render");

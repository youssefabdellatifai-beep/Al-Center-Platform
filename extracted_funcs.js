  const handleAddStudent = async () => {
    if (!newStudent.full_name || !newStudent.group_id) {
      toast.error("يرجى ملء الحقول المطلوبة (الاسم والمجموعة)");
      return;
    }
    setIsSubmittingStudent(true);
    const { data, error } = await supabase.from('students').insert([{
      teacher_id: teacherId,
      full_name: newStudent.full_name,
      student_phone: newStudent.student_phone,
      parent_phone: newStudent.parent_phone,
      group_id: newStudent.group_id
    }]).select();
    setIsSubmittingStudent(false);

    if (error) {
      console.error("Supabase Insert Error (Students):", error);
      toast.error("حدث خطأ أثناء إضافة الطالب");
    } else {
      toast.success("تم إضافة الطالب بنجاح");
      if (data) setStudents(prev => [data[0], ...prev]);
      setIsAddStudentModalOpen(false);
      setNewStudent({ full_name: '', student_phone: '', parent_phone: '', group_id: '' });
    }
  };

  const handleEditStudentSave = async () => {
    if (!editStudentForm || !editStudentForm.full_name) return toast.error("يرجى كتابة اسم الطالب");
    setIsSubmittingEditStudent(true);
    const { data, error } = await supabase.from('students').update({
      full_name: editStudentForm.full_name,
      group_id: editStudentForm.group_id,
      student_phone: editStudentForm.student_phone,
      parent_phone: editStudentForm.parent_phone
    }).eq('id', editStudentForm.id).select();
    setIsSubmittingEditStudent(false);
    if (error) toast.error("حدث خطأ");
    else {
      toast.success("تم التعديل بنجاح");
      if (data) {
        setStudents(students.map(s => s.id === data[0].id ? data[0] : s));
      }
      setIsEditStudentModalOpen(false);
    }
  };
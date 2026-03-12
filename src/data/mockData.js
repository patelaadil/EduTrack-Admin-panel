export const attendanceTrend = [
  { day: "Mon", pct: 88 }, { day: "Tue", pct: 91 }, { day: "Wed", pct: 78 },
  { day: "Thu", pct: 85 }, { day: "Fri", pct: 93 }, { day: "Sat", pct: 72 }, { day: "Today", pct: 82 },
];

export const classAttendance = [
  { cls: "10-A", pct: 91 }, { cls: "10-B", pct: 78 }, { cls: "9-A", pct: 85 },
  { cls: "9-B", pct: 88 }, { cls: "8-A", pct: 72 }, { cls: "8-B", pct: 95 },
];

export const studentsData = [
  { id: 1, name: "Riya Patel", roll: "ST042", class: "10-A", dob: "12 Jan 2010", contact: "+91 98765 43210", status: "Active", attendance: 87 },
  { id: 2, name: "Rahul Sharma", roll: "ST005", class: "10-A", dob: "3 May 2010", contact: "+91 87654 32109", status: "Active", attendance: 92 },
  { id: 3, name: "Priya Mehta", roll: "ST018", class: "10-B", dob: "22 Aug 2010", contact: "+91 76543 21098", status: "Active", attendance: 68 },
  { id: 4, name: "Arjun Singh", roll: "ST031", class: "9-A", dob: "7 Nov 2011", contact: "+91 65432 10987", status: "Active", attendance: 95 },
  { id: 5, name: "Kavya Reddy", roll: "ST019", class: "9-B", dob: "14 Feb 2011", contact: "+91 54321 09876", status: "Inactive", attendance: 55 },
  { id: 6, name: "Dev Kapoor", roll: "ST027", class: "8-A", dob: "30 Jun 2012", contact: "+91 43210 98765", status: "Active", attendance: 89 },
  { id: 7, name: "Sneha Joshi", roll: "ST033", class: "8-B", dob: "18 Sep 2012", contact: "+91 32109 87654", status: "Active", attendance: 97 },
];

export const teachersData = [
  { id: 1, name: "Mr. Arjun Verma", email: "arjun@school.edu", phone: "+91 99887 76655", classes: ["10-A", "10-B"], perms: { videos: true, marks: true, reports: true }, status: "Active" },
  { id: 2, name: "Ms. Sunita Rao", email: "sunita@school.edu", phone: "+91 88776 65544", classes: ["9-A", "9-B"], perms: { videos: true, marks: true, reports: false }, status: "Active" },
  { id: 3, name: "Mr. Pradeep Kumar", email: "pradeep@school.edu", phone: "+91 77665 54433", classes: ["8-A"], perms: { videos: false, marks: true, reports: true }, status: "Active" },
  { id: 4, name: "Ms. Ananya Iyer", email: "ananya@school.edu", phone: "+91 66554 43322", classes: ["8-B", "10-A"], perms: { videos: true, marks: false, reports: false }, status: "Inactive" },
];

export const classesData = [
  { id: 1, name: "Class 10-A", dept: "Science", year: "2025-26", teacher: "Mr. Arjun Verma", students: 42 },
  { id: 2, name: "Class 10-B", dept: "Commerce", year: "2025-26", teacher: "Ms. Sunita Rao", students: 38 },
  { id: 3, name: "Class 9-A", dept: "Science", year: "2025-26", teacher: "Mr. Pradeep Kumar", students: 40 },
  { id: 4, name: "Class 9-B", dept: "Arts", year: "2025-26", teacher: "Ms. Ananya Iyer", students: 35 },
  { id: 5, name: "Class 8-A", dept: "Science", year: "2025-26", teacher: "Mr. Arjun Verma", students: 44 },
  { id: 6, name: "Class 8-B", dept: "Commerce", year: "2025-26", teacher: "Ms. Sunita Rao", students: 37 },
];

export const attendanceRecords = [
  { id: 1, date: "12 Mar 2026", class: "10-A", subject: "Mathematics", teacher: "Mr. Arjun Verma", present: 38, absent: 3, late: 1, total: 42 },
  { id: 2, date: "12 Mar 2026", class: "9-B", subject: "Science", teacher: "Ms. Sunita Rao", present: 30, absent: 4, late: 1, total: 35 },
  { id: 3, date: "11 Mar 2026", class: "10-B", subject: "English", teacher: "Ms. Ananya Iyer", present: 35, absent: 2, late: 1, total: 38 },
  { id: 4, date: "11 Mar 2026", class: "8-A", subject: "History", teacher: "Mr. Pradeep Kumar", present: 40, absent: 4, late: 0, total: 44 },
  { id: 5, date: "10 Mar 2026", class: "9-A", subject: "Mathematics", teacher: "Mr. Arjun Verma", present: 36, absent: 3, late: 1, total: 40 },
];

export const notificationsData = [
  { id: 1, title: "Exam Schedule Released", body: "Mid-term exams start from 20th March. Check timetable.", sentBy: "Admin", target: "All Students", time: "2 hrs ago", readCount: 198, total: 248 },
  { id: 2, title: "Parent-Teacher Meeting", body: "PTM scheduled on 15th March at 10 AM.", sentBy: "Admin", target: "Everyone", time: "Yesterday", readCount: 310, total: 412 },
  { id: 3, title: "Holiday Announcement", body: "School will remain closed on 14th March (Holi).", sentBy: "Admin", target: "Everyone", time: "2 days ago", readCount: 400, total: 412 },
  { id: 4, title: "Fee Reminder", body: "Last date for Q4 fee payment is 18th March.", sentBy: "Admin", target: "All Students", time: "3 days ago", readCount: 120, total: 248 },
];

export const videosData = [
  { id: 1, title: "Introduction to Quadratic Equations", subject: "Mathematics", class: "10-A", teacher: "Mr. Arjun Verma", date: "10 Mar 2026", duration: "12:34" },
  { id: 2, title: "Photosynthesis Explained", subject: "Science", class: "9-B", teacher: "Ms. Sunita Rao", date: "9 Mar 2026", duration: "18:22" },
  { id: 3, title: "Essay Writing Techniques", subject: "English", class: "10-B", teacher: "Ms. Ananya Iyer", date: "8 Mar 2026", duration: "09:45" },
];

export const slidersData = [
  { id: 1, title: "Welcome Back — Spring Term 2026", active: true },
  { id: 2, title: "Mid-Term Exam Notice", active: true },
  { id: 3, title: "Annual Sports Day — 25 March", active: false },
];

export const recentRegs = [
  { name: "Vikram Nair", class: "8-B", date: "12 Mar 2026" },
  { name: "Meena Sharma", class: "10-A", date: "11 Mar 2026" },
  { name: "Rohan Das", class: "9-A", date: "10 Mar 2026" },
  { name: "Tara Singh", class: "9-B", date: "9 Mar 2026" },
  { name: "Aditi Kulkarni", class: "8-A", date: "8 Mar 2026" },
];

export const marksData = [
  { student: "Riya Patel", subject: "Mathematics", exam: "Midterm", obtained: 42, total: 50, pct: 84, grade: "A" },
  { student: "Rahul Sharma", subject: "Science", exam: "Final", obtained: 38, total: 50, pct: 76, grade: "B" },
  { student: "Priya Mehta", subject: "English", exam: "Unit Test", obtained: 18, total: 25, pct: 72, grade: "B" },
  { student: "Arjun Singh", subject: "History", exam: "Midterm", obtained: 47, total: 50, pct: 94, grade: "A+" },
];

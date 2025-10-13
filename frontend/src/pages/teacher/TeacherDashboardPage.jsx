// src/pages/teacher/TeacherDashboardPage.jsx

import React from 'react';
import { useAuthStore } from '../../store/authStore';

export function TeacherDashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Teacher Dashboard</h1>
      <p className="text-xl">Welcome, {user?.full_name || 'Teacher'}!</p>
      {/* Course and Exam lists will go here */}
    </div>
  );
}

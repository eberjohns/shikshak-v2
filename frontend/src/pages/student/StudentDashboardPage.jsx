// src/pages/student/StudentDashboardPage.jsx

import React from 'react';
import { useAuthStore } from '../../store/authStore';

export function StudentDashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Student Dashboard</h1>
      <p className="text-xl">Welcome, {user?.full_name || 'Student'}!</p>
      {/* Enrolled course list will go here */}
    </div>
  );
}

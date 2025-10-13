import React from 'react';
import useAuthStore from '../../store/authStore';

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  return (
    <div>
      <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
      <p className="mt-4">Welcome, {user?.name || user?.email} — this will show your courses and exams.</p>
    </div>
  );
}

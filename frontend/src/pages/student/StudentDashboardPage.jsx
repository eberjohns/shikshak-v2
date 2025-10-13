// src/pages/student/StudentDashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuthStore } from '../../store/authStore';
import { CourseCard } from '../../components/ui/CourseCard';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export function StudentDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/student/my-courses');
        setEnrolledCourses(response.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch enrolled courses.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-xl text-gray-600">Welcome, {user?.full_name || 'Student'}!</p>
        </div>
        <Button asChild>
          <Link to="/student/browse-courses">
            <PlusCircle className="mr-2 h-4 w-4" /> Browse Courses
          </Link>
        </Button>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Your Enrolled Courses</h2>
      {loading && <p>Loading your courses...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <>
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <CourseCard key={course.id} course={course} isEnrolled={true} />
              ))}
            </div>
          ) : (
            <p>You are not enrolled in any courses yet. Why not browse some?</p>
          )}
        </>
      )}
    </div>
  );
}


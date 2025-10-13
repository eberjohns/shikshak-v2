// src/pages/teacher/TeacherDashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuthStore } from '../../store/authStore';
import { CourseCard } from '../../components/ui/CourseCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// A simple component to display exam info
const ExamListItem = ({ exam }) => (
  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
    <div>
      <p className="font-semibold">{exam.title}</p>
      <p className="text-sm text-gray-500">Status: <span className={`font-medium ${exam.status === 'published' ? 'text-green-600' : 'text-yellow-600'}`}>{exam.status}</span></p>
    </div>
    <Button variant="outline" size="sm" asChild>
       {/* This link will eventually go to the exam detail page */}
      <Link to={`/teacher/exams/${exam.id}`}>Manage Exam</Link>
    </Button>
  </div>
);

export function TeacherDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesRes, examsRes] = await Promise.all([
          apiClient.get('/teacher/courses'),
          apiClient.get('/teacher/exams'),
        ]);
        setCourses(coursesRes.data);
        setExams(examsRes.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-xl text-gray-600">Welcome, {user?.full_name || 'Teacher'}!</p>
        </div>
        <Button asChild>
          <Link to="/teacher/courses/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Course
          </Link>
        </Button>
      </div>

      {loading && <p>Loading your dashboard...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Courses Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center"><BookOpen className="mr-2 h-6 w-6" /> Your Courses</h2>
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} role="teacher" />
                ))}
              </div>
            ) : (
              <p>You haven't created any courses yet.</p>
            )}
          </div>

          {/* Exams Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Your Exams</h2>
            {exams.length > 0 ? (
               <div className="space-y-4">
                {exams.map((exam) => (
                  <ExamListItem key={exam.id} exam={exam} />
                ))}
              </div>
            ) : (
              <p>You haven't created any exams yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// src/pages/teacher/TeacherCourseDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { TopicList } from '../../components/ui/TopicList';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { BarChart2 } from 'lucide-react';

export function TeacherCourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/teacher/courses/${courseId}`);
        setCourse(response.data);
      } catch (err) {
        setError('Failed to fetch course details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleGenerateExam = async (topicId) => {
    if (!confirm('Are you sure you want to generate a new draft exam for this topic?')) {
      return;
    }
    try {
      await apiClient.post(`/teacher/topics/${topicId}/generate-exam`);
      alert('Draft exam generated successfully! You can manage it from your dashboard.');
      navigate('/teacher/dashboard');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to generate exam.');
    }
  };

  if (loading) return <p>Loading course details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!course) return <p>Course not found.</p>;

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold">{course.course_name}</h1>
            <p className="text-lg text-gray-600">Taught by: {course.teacher.full_name}</p>
        </div>
        <Button asChild>
            <Link to={`/teacher/courses/${courseId}/analytics`}>
                <BarChart2 className="mr-2 h-4 w-4" /> View Analytics
            </Link>
        </Button>
      </div>
      <Separator className="my-6" />
      <h2 className="text-2xl font-semibold mb-4">Course Schedule & Topics</h2>
      <TopicList
        schedule={course.schedule}
        role="teacher"
        onGenerateExam={handleGenerateExam}
      />
    </div>
  );
}

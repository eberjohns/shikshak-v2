// src/pages/student/StudentCourseDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { TopicList } from '../../components/ui/TopicList';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

export function StudentCourseDetailPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseRes, examsRes] = await Promise.all([
          apiClient.get(`/courses/${courseId}`),
          apiClient.get(`/student/courses/${courseId}/exams`)
        ]);
        setCourse(courseRes.data);
        setExams(examsRes.data);
      } catch (err) {
        setError('Failed to fetch course data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  if (loading) return <p>Loading course details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!course) return <p>Course not found or you are not enrolled.</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold">{course.course_name}</h1>
      <p className="text-lg text-gray-600 mb-6">Taught by: {course.teacher.full_name}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Separator className="my-6" />
          <h2 className="text-2xl font-semibold mb-4">Course Schedule & Topics</h2>
          <TopicList schedule={course.schedule} role="student" />
        </div>
        <div>
          <Separator className="my-6" />
          <h2 className="text-2xl font-semibold mb-4">Available Exams</h2>
          {exams.length > 0 ? (
            <div className="space-y-4">
              {exams.map(exam => (
                <div key={exam.id} className="p-4 bg-white rounded-lg shadow-sm flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{exam.title}</h3>
                    <p className="text-sm text-gray-500">{exam.questions.length} questions</p>
                  </div>
                  <Button asChild>
                    <Link to={`/student/exams/${exam.id}/take`} state={{ exam: exam }}>
                      <Pencil className="mr-2 h-4 w-4" /> Take Exam
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No exams have been published for this course yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../lib/apiClient';
import Skeleton from '../../components/ui/Skeleton';

export default function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourse = React.useCallback(async () => {
    try {
      const res = await apiClient.get(`/api/student/my-courses/${courseId}`);
      setCourse(res.data || null);
    } catch (err) {
      console.error('Failed to fetch course', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const fetchExams = React.useCallback(async () => {
    try {
      const res = await apiClient.get(`/api/student/courses/${courseId}/exams`);
      setExams(res.data || []);
    } catch (err) {
      console.error('Failed to fetch exams', err);
    }
  }, [courseId]);

  useEffect(() => { fetchCourse(); fetchExams(); }, [courseId, fetchCourse, fetchExams]);

  if (loading) return <div>Loading course...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold">{course.title}</h1>
      <p className="text-sm text-slate-600">Teacher: {course.teacher_name || course.teacher?.name}</p>

      <section className="mt-6">
        <h2 className="font-semibold">Schedule</h2>
        {course.schedule?.length ? (
          <ul className="list-disc pl-6 mt-2">
            {course.schedule.map((s, idx) => <li key={idx}>{s}</li>)}
          </ul>
        ) : (
          <div className="mt-2 text-slate-600">No schedule available.</div>
        )}
      </section>

      <section className="mt-6">
        <h2 className="font-semibold">Exams</h2>
        {exams.length === 0 && <div className="mt-2">No published exams yet.</div>}
        <ul className="mt-2 space-y-2">
          {exams.map((e) => (
            <li key={e.id} className="bg-white p-3 rounded shadow flex items-center justify-between">
              <div>
                <div className="font-medium">{e.title}</div>
                <div className="text-sm text-slate-600">Status: {e.status || 'published'}</div>
              </div>
              <Link to={`/student/exams/${e.id}`} state={{ exam: e }} className="text-sky-600">Take Exam</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

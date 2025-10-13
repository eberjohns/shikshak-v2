import React, { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import apiClient from '../../lib/apiClient';
import CourseCard from '../../components/CourseCard';
import { Link } from 'react-router-dom';
import Skeleton from '../../components/ui/Skeleton';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyCourses = async () => {
    try {
      const res = await apiClient.get('/api/student/my-courses');
      setCourses(res.data || []);
    } catch (err) {
      console.error('Failed to fetch my courses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyCourses(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <Link to="/browse" className="text-sky-600 hover:underline">Browse Courses</Link>
      </div>

      <p className="mt-4">Welcome, {user?.name || user?.email} — here are your enrolled courses.</p>

      <div className="mt-6 space-y-4">
        {loading ? (
          [1,2,3].map((i) => (
            <div key={i} className="bg-white p-4 rounded shadow">
              <Skeleton width="50%" height={20} />
              <div className="mt-2"><Skeleton width="30%" height={14} /></div>
            </div>
          ))
        ) : (
          <>
            {courses.length === 0 && <div>No enrolled courses yet.</div>}
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} showEnroll={false} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

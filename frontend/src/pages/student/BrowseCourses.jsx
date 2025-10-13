import React, { useEffect, useState } from 'react';
import apiClient from '../../lib/apiClient';
import { useToast } from '../../components/ui/Toast';
import CourseCard from '../../components/CourseCard';
import Skeleton from '../../components/ui/Skeleton';

export default function BrowseCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState({});

  const toast = useToast();

  const fetchCourses = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/student/courses');
      setCourses(res.data || []);
    } catch (err) {
      console.error('Failed to fetch courses', err);
      toast.push('Failed to fetch courses', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const onEnroll = async (courseId) => {
      try {
      setEnrolling((s) => ({ ...s, [courseId]: true }));
      await apiClient.post(`/api/student/courses/${courseId}/enroll`);
      // Success: show inline message and refetch list
      toast.push('Enrolled successfully', 'success');
      fetchCourses();
    } catch (err) {
      console.error('Enroll failed', err);
      toast.push('Enroll failed', 'error');
    } finally {
      setEnrolling((s) => ({ ...s, [courseId]: false }));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Browse Courses</h1>
      {loading ? (
        <div className="grid gap-4">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white rounded shadow p-4">
              <Skeleton width="60%" height={20} />
              <div className="mt-2"><Skeleton width="40%" height={14} /></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.length === 0 && <div>No courses found.</div>}
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} onEnroll={onEnroll} showEnroll={c.can_enroll === undefined ? true : !!c.can_enroll} isEnrolling={!!enrolling[c.id]} />
          ))}
        </div>
      )}
    </div>
  );
}

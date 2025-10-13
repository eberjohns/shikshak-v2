// src/pages/student/BrowseCoursesPage.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { CourseCard } from '../../components/ui/CourseCard';

export function BrowseCoursesPage() {
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Fetch all available courses and the user's enrolled courses in parallel
        const [allCoursesRes, enrolledCoursesRes] = await Promise.all([
          apiClient.get('/student/courses'),
          apiClient.get('/student/my-courses'),
        ]);
        
        setAllCourses(allCoursesRes.data);
        setEnrolledCourseIds(new Set(enrolledCoursesRes.data.map(c => c.id)));
        setError('');
      } catch (err) {
        setError('Failed to fetch courses.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await apiClient.post(`/student/courses/${courseId}/enroll`);
      // Add the courseId to our set to instantly update the UI
      setEnrolledCourseIds(prevIds => new Set(prevIds).add(courseId));
      alert('Successfully enrolled!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to enroll.');
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Browse All Courses</h1>
      {loading && <p>Loading courses...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={handleEnroll}
              isEnrolled={enrolledCourseIds.has(course.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

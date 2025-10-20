// src/pages/student/StudentDashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuthStore } from '../../store/authStore';
import { CourseCard } from '../../components/ui/CourseCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, AlertTriangle, CalendarCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const PerformanceInsightCard = ({ summary }) => {
  if (!summary || !summary.most_common_error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-blue-500" /> Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Great job! No specific areas for improvement detected from your graded exams so far. Keep up the excellent work!</p>
        </CardContent>
      </Card>
    );
  }

  const percentage = ((summary.error_count / summary.total_graded_answers) * 100).toFixed(0);

  return (
    <Card className="bg-card border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-yellow-600" /> Area for Improvement</CardTitle>
      </CardHeader>
      <CardContent>
  <p className="text-lg font-bold capitalize">{summary.most_common_error} Errors</p>
  <p className="text-muted-foreground">
          We've noticed that <span className="font-semibold">{percentage}%</span> of your incorrect answers are related to <span className="font-semibold">'{summary.most_common_error}'</span> issues.
          Consider reviewing course materials related to this area.
        </p>
      </CardContent>
    </Card>
  );
};

const UpcomingTopicsCard = ({ topics }) => {
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    return (
        <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><CalendarCheck className="mr-2 h-5 w-5 text-blue-500" /> Upcoming Deadlines</CardTitle>
        <CardDescription className="text-muted-foreground">Topics due in the next 14 days.</CardDescription>
      </CardHeader>
            <CardContent>
                {topics.length > 0 ? (
                    <ul className="space-y-3">
                        {topics.map((topic, index) => (
                            <li key={index} className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-semibold">{topic.topic_name}</p>
                  <p className="text-xs text-muted-foreground">{topic.course_name}</p>
                                </div>
                <p className="font-medium text-foreground">{formatDate(topic.end_date)}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No upcoming deadlines in the next two weeks. Time to get ahead!</p>
                )}
            </CardContent>
        </Card>
    );
};


export function StudentDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [analytics, setAnalytics] = useState({ topics: [], performance: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [coursesRes, topicsRes, performanceRes] = await Promise.all([
          apiClient.get('/student/my-courses'),
          apiClient.get('/student/analytics/upcoming-topics'),
          apiClient.get('/student/analytics/performance-summary'),
        ]);
        
        setEnrolledCourses(coursesRes.data);
        setAnalytics({
          topics: topicsRes.data,
          performance: performanceRes.data
        });
        setError('');
      } catch (err) {
        setError('Failed to fetch dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-xl text-muted-foreground">Welcome, {user?.full_name || 'Student'}!</p>
        </div>
        <Button asChild>
          <Link to="/student/browse-courses">
            <PlusCircle className="mr-2 h-4 w-4" /> Browse Courses
          </Link>
        </Button>
      </div>

      {loading && <p>Loading your dashboard...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
                <UpcomingTopicsCard topics={analytics.topics} />
            </div>
            <div>
                <PerformanceInsightCard summary={analytics.performance} />
            </div>
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-4">Your Enrolled Courses</h2>
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

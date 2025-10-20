// src/pages/teacher/TeacherAnalyticsPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function TeacherAnalyticsPage() {
  const { courseId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/teacher/courses/${courseId}/analytics`);
        setAnalytics(response.data);
      } catch (err) {
        setError('Failed to fetch analytics data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [courseId]);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!analytics) return <p>No analytics data available for this course.</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Course Analytics</h1>
  <p className="text-lg text-muted-foreground mb-6">{analytics.course_name}</p>

      {/* Key Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_enrollment}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_submissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const avg = analytics.average_course_score;
                if (!avg || avg.length < 2) return 'N/A';
                const earned = Number(avg[0]) || 0;
                const possible = Number(avg[1]) || 0;
                if (possible === 0) return 'N/A';
                const pct = (earned / possible) * 100;
                return `${pct.toFixed(1)}%`;
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Most Misunderstood Topics */}
        <Card>
          <CardHeader>
            <CardTitle>Most Misunderstood Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                  <TableHead className="text-right">Average Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.most_misunderstood_topics.map(topic => (
                  <TableRow key={topic.topic_id}>
                    <TableCell className="font-medium">{topic.topic_name}</TableCell>
                    <TableCell className="text-right">{(() => {
                      const avg = topic.average_score;
                      if (!avg || avg.length < 2) return 'N/A';
                      const earned = Number(avg[0]) || 0;
                      const possible = Number(avg[1]) || 0;
                      if (possible === 0) return 'N/A';
                      const pct = (earned / possible) * 100;
                      return `${pct.toFixed(1)}%`;
                    })()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Common Error Types Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Common Error Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.common_error_types}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="error_type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// src/pages/student/MySubmissionsPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/student/my-submissions');
        setSubmissions(response.data);
      } catch (err) {
        setError('Failed to fetch submissions.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Submissions</h1>
      {loading && <p>Loading your submissions...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <>
          {submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.map(sub => (
                <Card key={sub.id}>
                  <CardHeader>
                    <CardTitle>{sub.exam.title}</CardTitle>
                    <CardDescription>Submitted on: {formatDate(sub.submitted_at)}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold">
                        Overall Score: {
                          Array.isArray(sub.overall_score) && sub.overall_score.length === 2
                            ? `${sub.overall_score[0].toFixed(1)} / ${sub.overall_score[1].toFixed(1)}`
                            : sub.overall_score !== null
                              ? `${sub.overall_score} / ?`
                              : 'Pending Grade'
                        }
                      </p>
                    </div>
                    <Button asChild disabled={sub.overall_score === null}>
                      <Link to={`/student/submissions/${sub.id}`}>
                        <FileText className="mr-2 h-4 w-4" /> View Feedback
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p>You have not submitted any exams yet.</p>
          )}
        </>
      )}
    </div>
  );
}

// src/pages/teacher/CreateCoursePage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateCoursePage() {
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState('');
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!syllabusFile) {
      setError('Please select a syllabus PDF file.');
      return;
    }
    setError('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('course_name', courseName);
    formData.append('syllabus_file', syllabusFile);

    try {
      await apiClient.post('/teacher/courses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Course created successfully! The AI has generated the schedule.');
      navigate('/teacher/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create course.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create a New Course</h1>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            Provide a name and a syllabus PDF. Our AI will automatically generate a course schedule for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="courseName">Course Name</Label>
              <Input
                id="courseName"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
                placeholder="e.g., Introduction to Python"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="syllabus">Syllabus (PDF only)</Label>
              <Input
                id="syllabus"
                type="file"
                accept=".pdf"
                onChange={(e) => setSyllabusFile(e.target.files[0])}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Course...' : 'Create Course and Generate Schedule'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

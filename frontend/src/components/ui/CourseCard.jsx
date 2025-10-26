import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

export function CourseCard({ course, onEnroll, isEnrolled, role = 'student' }) {
  const viewDetailsLink = role === 'student'
    ? `/student/courses/${course.id}`
    : `/teacher/courses/${course.id}`;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{course.course_name}</CardTitle>
  <CardDescription className="text-muted-foreground">Taught by: {course.teacher?.full_name || 'N/A'}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* We can add more course details here later, like a description */}
        <p className="text-sm text-muted-foreground">
          Click below to view details or manage the course.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button asChild variant="outline">
          <Link to={viewDetailsLink}>View Details</Link>
        </Button>
        {role === 'student' && onEnroll && (
          <Button onClick={() => onEnroll(course.id)} disabled={isEnrolled}>
            {isEnrolled ? 'Enrolled' : 'Enroll'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// src/components/CourseList.tsx

import React from 'react';
import { useDrop } from 'react-dnd';
import CourseItem from './CoureItem';
import { Course } from './types';

interface CourseListProps {
  courses: Course[];
  onDragStart: (courseId: string) => void;
  onDragEnd: () => void;
  onRemoveCourse: (courseId: string) => void;
}

const CourseList: React.FC<CourseListProps> = ({
  courses,
  onDragStart,
  onDragEnd,
  onRemoveCourse,
}) => {
  const [{ isOver }, drop] = useDrop<
    { courseId: string; eventId?: string },
    void,
    { isOver: boolean }
  >({
    accept: 'SCHEDULED_COURSE',
    drop: item => {
      onRemoveCourse(item.courseId);
    },
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`w-64 border-r border-gray-300 p-4 overflow-y-auto ${
        isOver ? 'bg-red-100' : ''
      }`}
    >
      {courses.map(course => (
        <CourseItem
          key={course.id}
          course={course}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      ))}
    </div>
  );
};

export default CourseList;

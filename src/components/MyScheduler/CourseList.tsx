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
  isEventDragging: boolean;
  onDeleteCourse: (courseId: string, courseKey: string) => void;
}

const CourseList: React.FC<CourseListProps> = ({
  courses,
  onDragStart,
  onDragEnd,
  onRemoveCourse,
  isEventDragging,
  onDeleteCourse,
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

  let backgroundColor = '';
  if (isEventDragging) {
    backgroundColor = isOver ? 'bg-red-300' : 'bg-red-100';
  }

  return (
    <div
      ref={drop}
      className={`w-full h-[177px] border-gray-300 p-4 overflow-y-auto border rounded-md ${backgroundColor} ${
        isOver ? 'bg-red-100' : ''
      }`}
    >
      {courses.map(course => (
        <CourseItem
          key={course.id}
          course={course}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDeleteCourse={onDeleteCourse}
        />
      ))}
    </div>
  );
};

export default CourseList;

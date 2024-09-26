// src/components/CourseItem.tsx
import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Course } from './types';

interface CourseItemProps {
  course: Course;
  onDragStart: (courseId: string) => void;
  onDragEnd: () => void;
}

const CourseItem: React.FC<CourseItemProps> = ({
  course,
  onDragStart,
  onDragEnd,
}) => {
  const [{ isDragging }, drag] = useDrag<
    { courseId: string },
    unknown,
    { isDragging: boolean }
  >({
    type: 'COURSE',
    item: { courseId: course.id },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      onDragEnd();
    },
  });

  useEffect(() => {
    if (isDragging) {
      onDragStart(course.id);
    }
  }, [isDragging, course.id, onDragStart]);

  return (
    <div
      ref={drag}
      className={`bg-gray-200 mb-2 p-2 rounded cursor-move ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {course.name}
    </div>
  );
};

export default CourseItem;

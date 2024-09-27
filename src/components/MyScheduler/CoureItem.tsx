// src/components/CourseItem.tsx
import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Course } from './types';
import { DeleteOutlined } from '@ant-design/icons';

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
      className={`bg-gray-200 mb-2 p-2 rounded cursor-move flex flex-row justify-between ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <label>
        {`${course.name} (${course.availableOfferings.length} option${course.availableOfferings.length > 1 ? 's' : ''})`}
      </label>
      <DeleteOutlined />
    </div>
  );
};

export default CourseItem;

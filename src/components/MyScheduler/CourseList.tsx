// src/components/CourseList.tsx

import React from 'react';
import { useDrop } from 'react-dnd';
import CourseItem from './CoureItem';
import { Course } from './types';
import { Empty } from 'antd';

interface CourseListProps {
  courses: Course[];
  onDragStart: (courseId: string) => void;
  onDragEnd: () => void;
  onRemoveCourse: (courseId: string) => void;
  isEventDragging: boolean;
  onDeleteCourse: (courseId: string, courseKey: string) => void;
  onRemoteCourseUnschedule: (courseId: string) => void;
}

const CourseList: React.FC<CourseListProps> = ({
  courses,
  onDragStart,
  onDragEnd,
  onRemoveCourse,
  isEventDragging,
  onDeleteCourse,
  onRemoteCourseUnschedule,
}) => {
  const [{ isOver }, drop] = useDrop<
    { courseId: string; eventId?: string; type: string },
    void,
    { isOver: boolean }
  >({
    accept: ['SCHEDULED_COURSE', 'SCHEDULED_REMOTE_COURSE'],
    drop: item => {
      if (item.type === 'SCHEDULED_COURSE') {
        onRemoveCourse(item.courseId);
      } else if (item.type === 'SCHEDULED_REMOTE_COURSE') {
        onRemoteCourseUnschedule(item.courseId);
      }
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
      className={`w-full h-[198px] border-gray-300 p-4 overflow-y-auto border rounded-md ${backgroundColor} ${
        isOver ? 'bg-red-100' : ''
      }`}
    >
      {courses.length > 0 &&
        courses.map(course => (
          <CourseItem
            key={course.id}
            course={course}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDeleteCourse={onDeleteCourse}
          />
        ))}
      {courses.length == 0 && <Empty description="No courses" />}
    </div>
  );
};

export default CourseList;

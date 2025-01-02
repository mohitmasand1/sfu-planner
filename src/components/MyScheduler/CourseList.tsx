// src/components/CourseList.tsx

import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import CourseItem from './CoureItem';
import { Empty } from 'antd';
import { Resizable, ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css';

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
  const [courseList1Height, setCourseList1Height] = useState<number>(198); // Initial height in pixels

  const handleResize = (
    event: React.SyntheticEvent<Element>,
    data: ResizeCallbackData,
  ) => {
    setCourseList1Height(data.size.height);
  };

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
    <Resizable
      height={courseList1Height}
      width={0}
      axis="y"
      minConstraints={[0, 100]}
      maxConstraints={[Infinity, 400]}
      onResize={handleResize}
      handle={
        <span
          className="resizable-handle"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '3px',
            cursor: 'row-resize',
            backgroundColor: '#e0e0e0',
            transition: 'background-color 0.3s', // Smooth transition on hover
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#b0b0b0'; // Darker gray on hover
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#e0e0e0'; // Restore original color
          }}
        />
      }
    >
      <div className="relative" style={{ height: courseList1Height }}>
        <div
          ref={drop}
          className={`flex-none justify-center items-center w-full border-gray-300 p-4 overflow-y-auto scrollbar border rounded-md ${backgroundColor} ${
            isOver ? 'bg-red-100' : ''
          }`}
          style={{ height: 'calc(100% - 5px)' }}
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
      </div>
    </Resizable>
  );
};

export default CourseList;

import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Course } from './types';
import { DeleteOutlined } from '@ant-design/icons';
import { Card, Typography, Space } from 'antd';

const { Text } = Typography;

interface CourseItemProps {
  course: Course;
  onDragStart: (courseId: string) => void;
  onDragEnd: () => void;
  onDeleteCourse: (courseId: string, courseKey: string) => void;
}

const CourseItem: React.FC<CourseItemProps> = ({
  course,
  onDragStart,
  onDragEnd,
  onDeleteCourse,
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
    <Card
      ref={drag}
      hoverable
      bordered={false}
      style={{
        marginBottom: '12px',
        borderRadius: '8px',
        boxShadow: isDragging
          ? '0 2px 8px rgba(0, 0, 0, 0.15)'
          : '0 1px 3px rgba(0, 0, 0, 0.1)',
        opacity: isDragging ? 0.6 : 1,
        cursor: 'move',
        transition: 'box-shadow 0.3s, opacity 0.3s',
        backgroundColor: '#d1d5db',
      }}
    >
      <Space
        direction="horizontal"
        style={{ justifyContent: 'space-between', width: '100%' }}
      >
        <Space direction="horizontal">
          <Text strong>{course.name}</Text>
          <Text type="secondary">
            | {course.availableOfferings.length} in-person option
            {course.availableOfferings.length > 1 ? 's' : ''},
          </Text>
          <Text type="secondary">
            {course.availableOfferings.length} remote option
            {course.availableOfferings.length > 1 ? 's' : ''}
          </Text>
        </Space>
        <DeleteOutlined
          style={{ fontSize: 18, color: 'grey', cursor: 'pointer' }}
          onClick={() => onDeleteCourse(course.id, course.name)}
        />
      </Space>
    </Card>
  );
};

export default CourseItem;

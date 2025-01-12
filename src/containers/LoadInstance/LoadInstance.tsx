import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { getSchedules } from '../NewSchedulePage/http';
import { Card, Space, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface LoadInstanceProps {
  onClickSchedule: (schedule: OutputSchedule) => void;
}

const LoadInstance: React.FC<LoadInstanceProps> = props => {
  const { onClickSchedule } = props;
  const { data } = useQuery<ScheduleResponse[]>({
    queryKey: [''],
    queryFn: () => getSchedules(),
  });
  console.log(JSON.stringify(data));

  function transformData(data: ScheduleResponse[]): OutputSchedule[] {
    return data.map(schedule => ({
      name: schedule.name,
      course_ids: schedule.course_ids.map(course => ({
        offering: transformOffering(course.offering),
        tutorial: transformTutorial(course.tutorial || ''),
        lab: transformTutorial(course.lab || ''),
      })),
    }));
  }

  function transformOffering(offering: string): string {
    // Transform "1251-cmpt-120-d100" to "CMPT 120 D100"
    const parts = offering.split('-');
    if (parts.length < 4) return offering; // Return original if format is unexpected
    const [_, , major, number, section] = parts;
    return `${major.toUpperCase()} ${number.toUpperCase()} ${section.toUpperCase()}`;
  }

  function transformTutorial(tutorial: string): string[] {
    // Transform "d101/d102" to ["D101", "D102"]
    return tutorial ? tutorial.split('/').map(tut => tut.toUpperCase()) : [];
  }

  const transformedData: OutputSchedule[] = transformData(data || []);

  console.log(JSON.stringify(transformedData));

  return (
    <div>
      {transformedData?.map(schedule => (
        <Card
          hoverable
          bordered={false}
          style={{
            marginBottom: '12px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            opacity: 1,
            transition: 'box-shadow 0.3s, opacity 0.3s',
            backgroundColor: '#d1d5db',
          }}
          onClick={() => onClickSchedule(schedule)}
        >
          <Space
            direction="horizontal"
            style={{ justifyContent: 'space-between', width: '100%' }}
          >
            <Space direction="horizontal">
              <Text strong>{schedule.name}</Text>
              {schedule.course_ids.map(course => (
                <Text type="secondary">{course.offering}</Text>
              ))}
            </Space>
            <DeleteOutlined
              style={{ fontSize: 18, color: 'grey', cursor: 'pointer' }}
              onClick={() => {}}
            />
          </Space>
        </Card>
      ))}
    </div>
  );
};

export default LoadInstance;

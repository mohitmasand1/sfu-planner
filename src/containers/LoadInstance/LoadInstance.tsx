import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { getSchedules } from '../NewSchedulePage/http';
import { Card, Space, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

type OutputCourse = {
  offering: string;
  tutorial: string[];
  lab: string[];
};

type OutputSchedule = {
  name: string;
  course_ids: OutputCourse[];
};

interface LoadInstanceProps {}

const LoadInstance: React.FC<LoadInstanceProps> = () => {
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
          onClick={() => {}}
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
    // <div className="flex flex-col">
    //   {transformedData?.map(course => (
    //     <div className="flex flex-row">
    //       <div>{course.name} - </div>
    //       <div className="flex flex-row">
    //         {course.course_ids.map(ids => (
    //           <>
    //             <div>
    //               {ids.offering}
    //               {`, `}
    //             </div>
    //             <div>{ids.tutorial.join(', ')}</div>
    //             <div>{ids.lab.join(', ')}</div>
    //           </>
    //         ))}
    //       </div>
    //     </div>
    //   ))}
    // </div>
  );
};

export default LoadInstance;

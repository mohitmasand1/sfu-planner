import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { getSchedules } from '../NewSchedulePage/http';
import { Button, Card, Checkbox, List } from 'antd';

interface LoadInstanceProps {
  onClickSchedule: (schedule: OutputSchedule) => void;
}

const LoadInstance: React.FC<LoadInstanceProps> = props => {
  const { onClickSchedule } = props;

  const [selectedSchedules, setSelectedSchedules] = useState<OutputSchedule[]>(
    [],
  );
  const { data } = useQuery<ScheduleResponse[]>({
    queryKey: [''],
    queryFn: () => getSchedules(),
  });
  console.log(JSON.stringify(data));

  function transformData(data: ScheduleResponse[]): OutputSchedule[] {
    return data.map(schedule => ({
      name: schedule.name,
      term: schedule.term,
      course_ids: schedule.course_ids.map(course => ({
        offering: transformOffering(course.offering),
        tutorial: course.tutorial || '',
        lab: course.lab || '',
      })),
    }));
  }

  function toggleSelect(schedule: OutputSchedule) {
    setSelectedSchedules(prev => {
      const isAlreadySelected = prev.some(s => s.name === schedule.name);
      return isAlreadySelected
        ? prev.filter(s => s.name !== schedule.name)
        : [...prev, schedule];
    });
  }

  function handleDeleteSelected() {
    // Replace with real delete logic or API call
    console.log('Deleting the following schedules:', selectedSchedules);

    // Clear selection after deletion
    setSelectedSchedules([]);
  }

  function isSelected(schedule: OutputSchedule): boolean {
    return selectedSchedules.some(s => s.name === schedule.name);
  }

  function transformOffering(offering: string): string {
    // Transform "1251-cmpt-120-d100" to "CMPT 120 D100"
    const parts = offering.split('-');
    if (parts.length < 4) return offering; // Return original if format is unexpected
    const [_, , major, number, section] = parts;
    return `${major.toUpperCase()} ${number.toUpperCase()} ${section.toUpperCase()}`;
  }

  const transformedData: OutputSchedule[] = transformData(data || []);

  console.log(JSON.stringify(transformedData));

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          type="primary"
          danger
          disabled={selectedSchedules.length === 0}
          onClick={handleDeleteSelected}
        >
          Delete Selected
        </Button>
      </div>

      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={transformedData}
        renderItem={schedule => {
          const checked = isSelected(schedule);
          const courseCount = schedule.course_ids.length;

          return (
            <List.Item>
              <Card
                hoverable
                className="
                    p-3 
                    transform transition-all duration-200
                    hover:scale-105 hover:shadow-md
                    rounded-md overflow-hidden
                    bg-white
                    border border-slate-200
                  "
                // Clicking the card calls onClickSchedule
                onClick={() => {
                  onClickSchedule?.(schedule);
                }}
              >
                <div className="flex items-start space-x-3">
                  {/* Checkbox to toggle selection */}
                  <Checkbox
                    className="mt-0.5 transform scale-120 origin-top-left"
                    checked={checked}
                    onClick={e => e.stopPropagation()} // Stop card's onClick
                    onChange={() => toggleSelect(schedule)}
                  />

                  {/* Schedule Info */}
                  <div className="flex-1">
                    {/* First row: name + small "courses count" badge */}
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base font-semibold m-0">
                        {schedule.name}
                      </h2>
                      <span
                        className="
                          bg-blue-100 
                          text-blue-600 
                          text-xs 
                          font-medium 
                          px-2 
                          py-0.5 
                          rounded-full
                        "
                      >
                        {courseCount} {courseCount === 1 ? 'Course' : 'Courses'}
                      </span>
                      <span
                        className="
                          bg-blue-100 
                          text-blue-600 
                          text-xs 
                          font-medium 
                          px-2 
                          py-0.5 
                          rounded-full
                        "
                      >
                        {`${schedule.term?.semester} ${schedule.term?.year}`}
                      </span>
                    </div>

                    {/* Second row: list of courses as "pills" */}
                    <div className="mt-1 flex flex-wrap gap-2">
                      {schedule.course_ids.map(course => (
                        <span
                          key={course.offering}
                          className="
                              inline-block
                              bg-slate-100 
                              text-slate-700 
                              text-xs 
                              px-2 
                              py-1 
                              rounded-full 
                              font-medium
                            "
                        >
                          {course.offering}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </List.Item>
          );
        }}
      />
    </div>
  );
};

export default LoadInstance;

import React from 'react';
import MyScheduler from '../../components/MyScheduler/MyScheduler';
import RemoteOfferingsDropzone from '../../components/MyScheduler/RemoteOfferingsDropzone';
import type { Event as CustomEvent } from '../../components/MyScheduler/types';
import CourseList from '../../components/MyScheduler/CourseList';
import { Collapse, CollapseProps, Tooltip } from 'antd';
import { CloseOutlined, CloudUploadOutlined } from '@ant-design/icons';

interface SchedulerSectionProps {
  allCourses: Course[];
  events: CustomEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CustomEvent[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  draggingCourseId: string | null;
  draggingEventId: string | null;
  draggingEventType:
    | 'lecture'
    | 'lab'
    | 'tutorial'
    | 'remote'
    | 'placeholder'
    | null;
  handleDragStart: (
    courseId: string,
    eventId?: string,
    eventType?: 'lecture' | 'lab' | 'tutorial' | 'remote' | 'placeholder',
  ) => void;
  handleDragEnd: () => void;
  handleRemoteOfferingSelect: (courseId: string, newOfferingId: string) => void;
  scheduledRemoteCourses: { course: Course; offering: Offering }[];
  handleRemoteCourseUnschedule: (courseId: string) => void;
  setHoveredOfferingId: React.Dispatch<React.SetStateAction<string | null>>;
  hoveredOfferingId: string | null;
  handleRemoveRemoteCourse: (courseId: string) => void;
  handleRemoveCourse: (courseId: string) => void;
  scheduledCourses: { course: Course; offering: Offering }[];
  isEventDragging: boolean;
  handleDeleteCourseFromList: (courseId: string, courseKey: string) => void;
  getItems: (panelStyle: React.CSSProperties) => CollapseProps['items'];
  panelStyle: React.CSSProperties;
  token: any; // Ant Design theme token
  handleSaveSchedule: (event: React.MouseEvent<HTMLSpanElement>) => void;
  handleDeleteAllSelections: () => void;
}

const SchedulerSection: React.FC<SchedulerSectionProps> = ({
  allCourses,
  events,
  setEvents,
  courses,
  setCourses,
  draggingCourseId,
  draggingEventId,
  draggingEventType,
  handleDragStart,
  handleDragEnd,
  handleRemoteOfferingSelect,
  scheduledRemoteCourses,
  handleRemoteCourseUnschedule,
  setHoveredOfferingId,
  hoveredOfferingId,
  handleRemoveRemoteCourse,
  handleRemoveCourse,
  scheduledCourses,
  isEventDragging,
  handleDeleteCourseFromList,
  getItems,
  panelStyle,
  token,
  handleSaveSchedule,
  handleDeleteAllSelections,
}) => {
  const SAVE_ICON_SIZE = 22;
  const CLOSE_ICON_SIZE = 20;
  return (
    <div className="flex flex-row flex-1 w-full overflow-hidden justify-center items-start min-h-0 px-6 pb-6 gap-4">
      <div className="flex flex-col flex-[3] justify-center min-h-0 h-full overflow-hidden gap-2">
        <MyScheduler
          allCourses={allCourses}
          events={events}
          setEvents={setEvents}
          courses={courses}
          setCourses={setCourses}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          draggingCourseId={draggingCourseId}
          draggingEventId={draggingEventId}
          draggingEventType={draggingEventType}
          onPlaceholderHover={setHoveredOfferingId} // Pass the setter function
          hoveredOfferingId={hoveredOfferingId}
          onRemoveRemoteCourse={handleRemoveRemoteCourse}
        />
        <RemoteOfferingsDropzone
          allCourses={allCourses}
          draggingCourseId={draggingCourseId}
          onRemoteOfferingSelect={handleRemoteOfferingSelect}
          scheduledRemoteCourses={scheduledRemoteCourses}
          onRemoteCourseUnschedule={handleRemoteCourseUnschedule}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
      </div>
      <div className="flex flex-col flex-[2] min-h-0 overflow-hidden max-h-full gap-4">
        <CourseList
          courses={courses}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onRemoveCourse={handleRemoveCourse}
          isEventDragging={isEventDragging}
          onDeleteCourse={handleDeleteCourseFromList}
          onRemoteCourseUnschedule={handleRemoteCourseUnschedule}
        />
        <div className="flex flex-col flex-1 overflow-y-auto min-h-0">
          {scheduledCourses.length > 0 && (
            <Collapse
              bordered={false}
              defaultActiveKey={['1']}
              style={{
                background: token.colorBgContainer,
                overflowY: 'auto',
              }}
              items={getItems(panelStyle)}
            />
          )}
          {(getItems(panelStyle)?.length || 0) > 0 && (
            <div className="flex flex-none self-center gap-6 overflow-auto h-10">
              <Tooltip title="Save schedule">
                <CloudUploadOutlined
                  style={{
                    cursor: 'pointer',
                    fontSize: SAVE_ICON_SIZE,
                    color: 'grey',
                  }}
                  onClick={handleSaveSchedule}
                />
              </Tooltip>
              <Tooltip title="Delete current schedule">
                <CloseOutlined
                  style={{
                    cursor: 'pointer',
                    fontSize: CLOSE_ICON_SIZE,
                    color: 'grey',
                  }}
                  onClick={handleDeleteAllSelections}
                />
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulerSection;

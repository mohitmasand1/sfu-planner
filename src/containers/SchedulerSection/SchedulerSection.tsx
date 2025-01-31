import React, { useState } from 'react';
import MyScheduler from '../../components/MyScheduler/MyScheduler';
import RemoteOfferingsDropzone from '../../components/MyScheduler/RemoteOfferingsDropzone';
import type { Event as CustomEvent } from '../../components/MyScheduler/types';
import CourseList from '../../components/MyScheduler/CourseList';
import {
  Button,
  Collapse,
  CollapseProps,
  // message,
  PopconfirmProps,
  theme,
  Form,
  Modal,
} from 'antd';
import CourseItemLabel from '../../components/CourseItem/CourseItemLabel';
import CourseItemContent from '../../components/CourseItem/CourseItemContent';
import Card from '../../components/Card/Card';
import Split from 'react-split';
import './styles.css';
import { useModals } from '../../hooks/ModalsContext';
import { useMutation } from '@tanstack/react-query';
import { saveSchedule } from '../NewSchedulePage/http';
import SaveInstancePage from '../SaveInstance/SaveInstance';
import LoadInstance from '../LoadInstance/LoadInstance';
import SFUButton from '../../components/Button/SFUButton';

interface SchedulerSectionProps {
  allCourses: Course[];
  events: CustomEvent[];
  courses: Course[];
  scheduledRemoteCourses: { course: Course; offering: Offering }[];
  scheduledCourses: { course: Course; offering: Offering }[];
  scheduleInPersonCourse: (courseId: string, offeringId: string) => void;
  scheduleRemoteCourse: (courseId: string, offeringId: string) => void;
  switchLab: (
    courseId: string,
    offeringId: string,
    labSessionId: string,
  ) => void;
  switchTutorial: (
    courseId: string,
    offeringId: string,
    tutorialSessionId: string,
  ) => void;
  unscheduleCourse: (courseId: string) => void;
  handleDeleteCourseFromList: (courseId: string, courseKey: string) => void;
  handleScheduledDelete: (courseKey: string, courseId: string) => () => void;
  loadSchedule: (savedData: any) => void; // Or your real type
  clearAll: () => void;
  courseColorMapRef: React.MutableRefObject<{
    [key: string]: string;
  }>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const SchedulerSection: React.FC<SchedulerSectionProps> = ({
  allCourses,
  events,
  courses,
  scheduledRemoteCourses,
  scheduledCourses,
  scheduleInPersonCourse,
  scheduleRemoteCourse,
  switchLab,
  switchTutorial,
  unscheduleCourse,
  handleDeleteCourseFromList,
  handleScheduledDelete,
  loadSchedule,
  clearAll,
  setLoading,
  courseColorMapRef,
}) => {
  const { token } = theme.useToken();
  const { openModal, closeModal } = useModals();
  const [form] = Form.useForm();

  const [draggingCourseId, setDraggingCourseId] = useState<string | null>(null);
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null);
  const [draggingEventType, setDraggingEventType] = useState<
    'lecture' | 'lab' | 'tutorial' | 'remote' | 'placeholder' | null
  >(null);
  const [hoveredOfferingId, setHoveredOfferingId] = useState<string | null>(
    null,
  );
  const [isEventDragging, setIsEventDragging] = useState<boolean>(false);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const panelStyle: React.CSSProperties = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };

  const handleDragStart = (
    courseId: string,
    eventId?: string,
    eventType?: 'lecture' | 'lab' | 'tutorial' | 'remote' | 'placeholder',
  ) => {
    setDraggingCourseId(courseId);
    if (eventId) {
      setDraggingEventId(eventId);
      setDraggingEventType(eventType || null);
      setIsEventDragging(true); // Set isEventDragging to true
    } else {
      // A course is being dragged from the course list
      setDraggingEventId(null);
      setDraggingEventType(null);
      setIsEventDragging(false); // Ensure isEventDragging is false
    }
  };

  const handleDragEnd = () => {
    setDraggingCourseId(null);
    setDraggingEventId(null);
    setDraggingEventType(null);
    setHoveredOfferingId(null);
    setIsEventDragging(false);
  };

  const handleScheduledDeleteCancel: PopconfirmProps['onCancel'] = e => {
    e?.stopPropagation();
  };

  const showCourseSelectionDeleteConfirm = (
    event: React.MouseEvent<HTMLSpanElement>,
  ) => {
    event.stopPropagation();
  };

  const getItems: (
    panelStyle: React.CSSProperties,
  ) => CollapseProps['items'] = panelStyle => {
    return scheduledCourses.map((course, index) => {
      const courseKey = course.course.name;
      const courseColor = courseColorMapRef.current[courseKey];

      const itemPanelStyle: React.CSSProperties = {
        ...panelStyle,
        background: courseColor ? `var(--${courseColor})` : 'transparent',
      };
      return {
        key: index,
        label: (
          <CourseItemLabel
            course={course}
            cancel={handleScheduledDeleteCancel}
            showPopover={showCourseSelectionDeleteConfirm}
            confirm={handleScheduledDelete}
          />
        ),
        children: <CourseItemContent course={course} />,
        style: itemPanelStyle,
      };
    });
  };

  const handleRevealHideAll = () => {
    const items = getItems(panelStyle);
    // If any panel is open, close all.
    // If none are open, open all.
    if (activeKeys.length > 0) {
      setActiveKeys([]);
    } else {
      const allKeys = items?.map(item => item.key as string) || [];
      setActiveKeys(allKeys);
    }
  };

  const handleSaveSchedule = async () => {
    try {
      const values = await form.validateFields(); // Validate and get form values
      const scheduleName = values.scheduleName;

      if (scheduledCourses.length === 0) {
        Modal.error({
          title: 'Error',
          content: 'No courses have been scheduled to save.',
        });
        return;
      }

      const scheduleData = {
        name: scheduleName, // Use the captured schedule name
        course_ids: scheduledCourses.map(course => ({
          offering: course.offering.path,
          lab:
            events.find(
              e => e.offeringId == course.offering.id && e.eventType === 'lab',
            )?.section || '',
          tutorial:
            events.find(
              e =>
                e.offeringId == course.offering.id &&
                e.eventType === 'tutorial',
            )?.section || '',
        })),
      };

      console.log(scheduleData);

      // Perform the save mutation
      await saveScheduleMutation.mutateAsync(scheduleData);

      // Show success message
      Modal.success({
        title: 'Success',
        content: 'Your schedule has been saved successfully!',
      });
    } catch (error) {
      if (error instanceof Error) {
        Modal.error({
          title: 'Error',
          content: error.message,
        });
      }
    } finally {
      form.resetFields(); // Reset form fields
      closeModal();
    }
  };

  const handleLoadSchedule = async (savedSchedule: OutputSchedule) => {
    closeModal();
    setLoading(true);
    await loadSchedule(savedSchedule);
    setLoading(false);
  };

  const saveScheduleMutation = useMutation({
    mutationFn: saveSchedule,
  });

  const totalCredits = scheduledCourses.reduce(
    (acc, course) => acc + parseInt(course.offering.specificData.info.units),
    0,
  );

  const numOfCourses = scheduledCourses.length;
  const hasScheduledCourses = (getItems(panelStyle)?.length || 0) > 0;

  return (
    <div className="flex flex-row flex-1 w-full overflow-hidden justify-center items-start min-h-0 px-6 pb-6 gap-4">
      <Split
        sizes={[67, 33]} // Initial sizes as percentages
        minSize={[550, 350]} // Minimum size for each pane in pixels
        gutterSize={3} // Thickness of the resizer bar
        gutterAlign="center"
        direction="horizontal" // Specifies horizontal split
        className="flex h-full w-full"
        gutter={(_, direction) => {
          const gutter = document.createElement('div');
          gutter.className = `gutter gutter-${direction}`;
          return gutter;
        }}
      >
        <Card className="rounded-md mr-2">
          <div className="flex flex-col flex-[3] justify-center min-h-0 h-full overflow-hidden gap-2">
            <MyScheduler
              allCourses={allCourses}
              events={events}
              courses={courses}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              draggingCourseId={draggingCourseId}
              draggingEventId={draggingEventId}
              draggingEventType={draggingEventType}
              onPlaceholderHover={setHoveredOfferingId} // Pass the setter function
              hoveredOfferingId={hoveredOfferingId}
              onScheduleInPersonCourse={scheduleInPersonCourse}
              onSwitchLab={switchLab}
              onSwitchTutorial={switchTutorial}
              onUnscheduleCourse={unscheduleCourse}
            />
            <RemoteOfferingsDropzone
              allCourses={allCourses}
              draggingCourseId={draggingCourseId}
              onScheduleRemoteCourse={scheduleRemoteCourse}
              scheduledRemoteCourses={scheduledRemoteCourses}
              onUnscheduleCourse={unscheduleCourse}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          </div>
        </Card>
        <Card className="rounded-md ml-2">
          <div className="flex flex-col flex-[2] min-h-0 overflow-hidden max-h-full gap-4">
            <CourseList
              courses={courses}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onRemoveCourse={handleDeleteCourseFromList}
              isEventDragging={isEventDragging}
              onUnscheduleCourse={unscheduleCourse}
            />
            <div className="flex flex-col flex-1 overflow-y-auto scrollbar min-h-0 gap-3 h-full justify-between">
              {scheduledCourses.length > 0 && (
                <Collapse
                  bordered={false}
                  defaultActiveKey={['0']}
                  style={{
                    background: token.colorBgContainer,
                    overflowY: 'auto',
                  }}
                  items={getItems(panelStyle)}
                  activeKey={activeKeys}
                  onChange={keys => setActiveKeys(keys as string[])}
                />
              )}

              <div className="flex flex-col gap-2">
                <div className="flex justify-center gap-4">
                  <label className="text-sm">{`Courses: ${numOfCourses}`}</label>
                  <label className="text-sm">{`Total Credits: ${totalCredits}`}</label>
                </div>
                <div className="flex flex-wrap justify-center self-center gap-4 scrollbar">
                  <SFUButton
                    disabled={!hasScheduledCourses}
                    onClick={() =>
                      openModal({
                        title: 'Save Schedule',
                        content: (
                          <SaveInstancePage
                            form={[form]}
                            schedule={scheduledCourses}
                          />
                        ),
                        okText: 'Save',
                        cancelText: 'Cancel',
                        centered: true,
                        onOk: handleSaveSchedule,
                      })
                    }
                  >
                    Save
                  </SFUButton>
                  {/* <Button
                    className="!bg-red-600 
          !border-red-600 
          !text-white 
          hover:!bg-red-500 
          hover:!border-red-500"
                    type="primary"
                    disabled={!hasScheduledCourses}
                    onClick={() =>
                      openModal({
                        title: 'Save Schedule',
                        content: (
                          <SaveInstancePage
                            form={[form]}
                            schedule={scheduledCourses}
                          />
                        ),
                        okText: 'Save',
                        cancelText: 'Cancel',
                        centered: true,
                        onOk: handleSaveSchedule,
                      })
                    }
                  >
                    Save
                  </Button> */}
                  <SFUButton disabled={!hasScheduledCourses} onClick={clearAll}>
                    Clear
                  </SFUButton>
                  {/* <Button
                    className="bg-red-600"
                    type="primary"
                    disabled={!hasScheduledCourses}
                    onClick={clearAll}
                  >
                    Clear
                  </Button> */}
                  {/* <Button
                    className="bg-red-600"
                    type="primary"
                    onClick={() =>
                      openModal({
                        title: 'Load Schedule',
                        content: (
                          <LoadInstance onClickSchedule={handleLoadSchedule} />
                        ),
                        okText: 'Load',
                        footer: null,
                        centered: true,
                      })
                    }
                  >
                    Load
                  </Button> */}
                  <SFUButton
                    onClick={() =>
                      openModal({
                        title: 'Load Schedule',
                        content: (
                          <LoadInstance onClickSchedule={handleLoadSchedule} />
                        ),
                        okText: 'Load',
                        footer: null,
                        centered: true,
                      })
                    }
                  >
                    Load
                  </SFUButton>
                  <SFUButton
                    disabled={!hasScheduledCourses}
                    onClick={handleRevealHideAll}
                  >
                    Open/Close All
                  </SFUButton>
                  {/* <Button
                    className="bg-red-600"
                    type="primary"
                    disabled={!hasScheduledCourses}
                    onClick={handleRevealHideAll}
                  >
                    Open/Close All
                  </Button> */}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Split>
    </div>
  );
};

export default SchedulerSection;

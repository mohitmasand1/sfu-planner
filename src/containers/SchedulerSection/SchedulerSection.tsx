import React, { useState } from 'react';
import MyScheduler from '../../components/MyScheduler/MyScheduler';
import RemoteOfferingsDropzone from '../../components/MyScheduler/RemoteOfferingsDropzone';
import type { Event as CustomEvent } from '../../components/MyScheduler/types';
import CourseList from '../../components/MyScheduler/CourseList';
import {
  Button,
  Collapse,
  CollapseProps,
  message,
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
import SaveInstancePage from '../SaveInstanceModal/SaveInstancePage';
import LoadInstance from '../LoadInstance/LoadInstance';

interface SchedulerSectionProps {
  allCourses: Course[];
  setAllCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  events: CustomEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CustomEvent[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  setScheduledCourses: React.Dispatch<
    React.SetStateAction<
      {
        course: Course;
        offering: Offering;
      }[]
    >
  >;
  setScheduledRemoteCourses: React.Dispatch<
    React.SetStateAction<
      {
        course: Course;
        offering: Offering;
      }[]
    >
  >;
  scheduledRemoteCourses: { course: Course; offering: Offering }[];
  scheduledCourses: { course: Course; offering: Offering }[];
  courseColorMapRef: React.MutableRefObject<{
    [key: string]: string;
  }>;
  availableColorsRef: React.MutableRefObject<string[]>;
}

const SchedulerSection: React.FC<SchedulerSectionProps> = ({
  allCourses,
  setAllCourses,
  events,
  setEvents,
  courses,
  setCourses,
  setScheduledCourses,
  setScheduledRemoteCourses,
  scheduledRemoteCourses,
  scheduledCourses,
  courseColorMapRef,
  availableColorsRef,
}) => {
  const { token } = theme.useToken();
  const { openModal } = useModals();
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
    // console.log('handleDragEnd called');
    setDraggingCourseId(null);
    setDraggingEventId(null);
    setDraggingEventType(null);
    setHoveredOfferingId(null);
    setIsEventDragging(false);
  };

  const handleRemoveCourse = (courseId: string) => {
    // Remove all events for this course
    setEvents(prevEvents => prevEvents.filter(e => e.courseId !== courseId));

    // Add the course back to the course list
    const course = allCourses.find(c => c.id === courseId);
    if (course) {
      setCourses(prevCourses => {
        // Prevent duplicates
        if (!prevCourses.find(c => c.id === courseId)) {
          return [...prevCourses, course];
        }
        return prevCourses;
      });
    }
  };

  const handleRemoteOfferingSelect = (
    courseId: string,
    newOfferingId: string,
  ) => {
    // 1. Check if this course is already scheduled
    const alreadyScheduled =
      scheduledRemoteCourses.find(sc => sc.course.id === courseId) ||
      scheduledCourses.find(sc => sc.course.id === courseId);

    if (alreadyScheduled) {
      handleRemoveRemoteCourse(courseId);
      // c) remove from scheduled courses
      setScheduledCourses(prev =>
        prev.filter(item => item.course.id !== courseId),
      );
    }

    // 2. Schedule the NEW offering
    const course = allCourses.find(c => c.id === courseId);
    if (!course) return;

    const offering = course.availableOfferings.find(
      o => o.id === newOfferingId,
    );
    if (!offering) return;

    const newEvent: CustomEvent = {
      id: `event-${courseId}-remote-${newOfferingId}`,
      className: course.className || '',
      title: `${course.name} (Remote)`,
      section: offering.specificData.info.section,
      start: new Date(), // Arbitrary
      end: new Date(), // Arbitrary
      allDay: true,
      courseId,
      offeringId: newOfferingId,
      eventType: 'remote',
    };

    // Add new event
    setEvents(prevEvents => [...prevEvents, newEvent]);

    // Add new scheduled remote
    setScheduledRemoteCourses(prev => [...prev, { course, offering }]);

    setScheduledCourses(prev => [...prev, { course, offering }]);
  };

  // Function to unschedule a remote course
  const handleRemoteCourseUnschedule = (courseId: string) => {
    //setDraggingCourseId(null);
    // Remove the course from scheduled remote courses
    handleRemoveRemoteCourse(courseId);

    // Add the course back to the course list
    const course = allCourses.find(c => c.id === courseId);
    if (course) {
      setCourses(prevCourses => {
        // Prevent duplicates
        if (!prevCourses.find(c => c.id === courseId)) {
          return [...prevCourses, course];
        }
        return prevCourses;
      });
    }
  };

  const handleRemoveRemoteCourse = (courseId: string) => {
    setScheduledRemoteCourses(prev =>
      prev.filter(item => item.course.id !== courseId),
    );

    setEvents(prevEvents => prevEvents.filter(e => e.courseId !== courseId));
  };

  const handleDeleteCourseFromList = (courseId: string, courseKey: string) => {
    // Remove the course from unscheduled courses
    setCourses(prevCourses => prevCourses.filter(c => c.id !== courseId));
    // Also remove the course from allCourses
    setAllCourses(prevAllCourses =>
      prevAllCourses.filter(c => c.id !== courseId),
    );
    const removedColor = courseColorMapRef.current[courseKey];
    if (removedColor) {
      availableColorsRef.current.push(removedColor);
      delete courseColorMapRef.current[courseKey];
    }
  };

  const handleDeleteAllSelections = () => {
    // modal.warning({
    //   title: 'Delete all selections',
    //   content: <div>Delete all selections?</div>,
    //   onOk() {
    //     message.success('Deleted all');
    //     // Clear all courses
    //     setAllCourses([]);
    //     // Clear events
    //     setEvents([]);
    //     // Clear unscheduled courses
    //     setCourses([]);
    //     // Clear scheduled courses
    //     setScheduledCourses([]);
    //     // Clear scheduled remote courses
    //     setScheduledRemoteCourses([]);
    //     // Reset dragging state
    //     handleDragEnd();
    //     sessionStorage.removeItem('schedule');
    //     allCourses.forEach(course => {
    //       const courseKey = course.name;
    //       const removedColor = courseColorMapRef.current[courseKey];
    //       if (removedColor) {
    //         availableColorsRef.current.push(removedColor);
    //         delete courseColorMapRef.current[courseKey];
    //       }
    //     });
    //   },
    //   centered: true,
    // });
  };

  const handleScheduledDelete = (courseKey: string, courseId: string) => () => {
    // Remove the course from allCourses
    setAllCourses(prevAllCourses =>
      prevAllCourses.filter(c => c.id !== courseId),
    );
    // Remove any events associated with the course
    setEvents(prevEvents => prevEvents.filter(e => e.courseId !== courseId));
    // Remove the course from unscheduled courses
    setCourses(prevCourses => prevCourses.filter(c => c.id !== courseId));
    // Remove the course from remote courses, incase it was a remote course
    setScheduledRemoteCourses(prevRemotes =>
      prevRemotes.filter(c => c.course.id !== courseId),
    );
    // Reset dragging state if necessary
    if (draggingCourseId === courseId) {
      handleDragEnd();
    }
    // Restore the color to the available pool
    const removedColor = courseColorMapRef.current[courseKey];
    if (removedColor) {
      availableColorsRef.current.push(removedColor);
      delete courseColorMapRef.current[courseKey];
    }
    message.success('Removed');
  };

  const handleScheduledDeleteCancel: PopconfirmProps['onCancel'] = e => {
    // console.log(e);
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
    }
  };

  const saveScheduleMutation = useMutation({
    mutationFn: saveSchedule,
  });

  const handleLoadSchedule = () => {
    // showModal(event, 'Load Schedule', <LoadInstance />);
    // click on the card
    // with the card we can identify the name of the schedule
    // clear all current schedule/course state lists
    // fetch the course data based on the id's e.g. 2025-spring-cmpt-120-d100 -> [2025 spring cmpt 120 d100] for each course
    // run it thru the onSearchClick code
    // save transformed data into a list. Now we need to add it as if its being searched for, and then dragged
    // we can add it to the scheduledCourses / scheduledRemoteCourses
  };

  const totalCredits = scheduledCourses.reduce(
    (acc, course) => acc + parseInt(course.offering.specificData.info.units),
    0,
  );

  const numOfCourses = scheduledCourses.length;

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
        </Card>
        <Card className="rounded-md ml-2">
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
            <div className="flex flex-col flex-1 overflow-y-auto scrollbar min-h-0 gap-3">
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
              {(getItems(panelStyle)?.length || 0) > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-center gap-4">
                    <label className="text-sm">{`Courses: ${numOfCourses}`}</label>
                    <label className="text-sm">{`Total Credits: ${totalCredits}`}</label>
                  </div>
                  <div className="flex flex-wrap justify-center self-center gap-4 scrollbar">
                    <Button
                      className="bg-sky-100 text-neutral-900"
                      type="primary"
                      onClick={() =>
                        openModal({
                          title: 'Save Schedule',
                          content: <SaveInstancePage form={[form]} />,
                          okText: 'Save',
                          cancelText: 'Cancel',
                          onOk: handleSaveSchedule,
                        })
                      }
                    >
                      Save
                    </Button>
                    <Button
                      className="bg-sky-100 text-neutral-900"
                      type="primary"
                      onClick={handleDeleteAllSelections}
                    >
                      Clear
                    </Button>
                    <Button
                      className="bg-sky-100 text-neutral-900"
                      type="primary"
                      onClick={() =>
                        openModal({
                          title: 'Load Schedule',
                          content: <LoadInstance />,
                          okText: 'Load',
                          cancelText: 'Cancel',
                          onOk: handleLoadSchedule,
                        })
                      }
                    >
                      Load
                    </Button>
                    <Button
                      className="bg-sky-100 text-neutral-900"
                      type="primary"
                      onClick={handleRevealHideAll}
                    >
                      Open/Close All
                    </Button>
                    {/* <Tooltip title="Save schedule">
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
                    </Tooltip> */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </Split>
    </div>
  );
};

export default SchedulerSection;

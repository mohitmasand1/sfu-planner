import React, { useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button, Collapse, Select, theme, Modal, Tooltip, message } from 'antd';
import type { CollapseProps, ModalProps, PopconfirmProps } from 'antd';
import type { Event as CustomEvent } from '../../components/MyScheduler/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMajorCourses, fetchMajors, fetchCourseOfferings } from './http';
import { CourseOffering, modalData, Option, SemesterData } from './types';
import { CloudUploadOutlined, CloseOutlined } from '@ant-design/icons';
import SaveInstancePage from '../SaveInstanceModal/SaveInstancePage';
import LoadingOverlay from '../../components/Loading/LoadingOverlay';
import CourseItemLabel from '../../components/CourseItem/CourseItemLabel';
import CourseItemContent from '../../components/CourseItem/CourseItemContent';
import { parseTermCode } from '../../utils/parseTermCode';
import MyScheduler from '../../components/MyScheduler/MyScheduler';
import CourseList from '../../components/MyScheduler/CourseList';
import RemoteOfferingsDropzone from '../../components/MyScheduler/RemoteOfferingsDropzone';

const SAVE_ICON_SIZE = 22;
const CLOSE_ICON_SIZE = 20;

const colors = [
  'bg-selection-1',
  'bg-selection-2',
  'bg-selection-3',
  'bg-selection-4',
  'bg-selection-5',
  'bg-selection-6',
  'bg-selection-7',
  'bg-selection-8',
];

export interface NewSchedulePageProps {
  setTermCode: React.Dispatch<React.SetStateAction<string>>;
  termCode: string;
  semesters?: SemesterData[];
}

const NewSchedulePage: React.FC<NewSchedulePageProps> = props => {
  const { termCode, setTermCode, semesters } = props;
  // const { termCode } = useOutletContext<SharedContext>();
  const term = parseTermCode(termCode);

  // Create a ref to store the course-to-color mapping
  const courseColorMapRef = useRef<{ [key: string]: string }>({});
  const availableColorsRef = useRef<string[]>([...colors]); // Initially, all colors are available
  const queryClient = useQueryClient();
  const { token } = theme.useToken();
  const [modal, contextHolder] = Modal.useModal();

  const [majorSelected, setMajorSelected] = useState<string | null | undefined>(
    null,
  );
  const [numberSelected, setNumberSelected] = useState<
    string | number | null | undefined
  >(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<modalData>({
    title: '',
    content: <></>,
  });
  const [loading, setLoading] = useState(false);
  // const [appliedCourses, setAppliedCourses] = useState<CourseOffering[]>(
  //   JSON.parse(sessionStorage.getItem('schedule') || '[]'),
  // );
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [courses, setCourses] = useState<Course[]>(allCourses);
  const [events, setEvents] = useState<CustomEvent[]>([]);
  const [scheduledCourses, setScheduledCourses] = useState<
    { course: Course; offering: Offering }[]
  >([]);
  const [draggingCourseId, setDraggingCourseId] = useState<string | null>(null);
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null);
  const [draggingEventType, setDraggingEventType] = useState<
    'lecture' | 'lab' | 'tutorial' | 'remote' | 'placeholder' | null
  >(null);
  const [hoveredOfferingId, setHoveredOfferingId] = useState<string | null>(
    null,
  );
  const [isEventDragging, setIsEventDragging] = useState<boolean>(false);
  // State to keep track of scheduled remote courses
  const [scheduledRemoteCourses, setScheduledRemoteCourses] = useState<
    { course: Course; offering: Offering }[]
  >([]);

  // Added to track the previous termCode
  const previousTermCode = useRef(termCode);

  useEffect(() => {
    // Check if termCode has changed
    if (previousTermCode.current !== termCode) {
      // setAppliedCourses([]);
      setMajorSelected(null);
      setNumberSelected(null);
      sessionStorage.removeItem('schedule');
      // console.log('changed termCode');
      // Update previousTermCode to the new termCode
      previousTermCode.current = termCode;
      // Clear all courses
      setAllCourses([]);
      // Clear events
      setEvents([]);
      // Clear unscheduled courses
      setCourses([]);
      // Clear scheduled courses
      setScheduledCourses([]);
      // Reset dragging state
      handleDragEnd();
    }
  }, [termCode]);

  useEffect(() => {
    // Map courseId to offeringId
    const courseOfferingMap: { [courseId: string]: string } = {};

    events.forEach(event => {
      if (!courseOfferingMap[event.courseId]) {
        courseOfferingMap[event.courseId] = event.offeringId!;
      }
    });

    // Build scheduledCourses array
    const scheduled = Object.keys(courseOfferingMap)
      .map(courseId => {
        const offeringId = courseOfferingMap[courseId];
        const course = allCourses.find(c => c.id === courseId);
        const offering = course?.availableOfferings.find(
          o => o.id === offeringId,
        );

        if (course && offering) {
          return { course, offering };
        } else {
          return null;
        }
      })
      .filter(item => item !== null) as {
      course: Course;
      offering: Offering;
    }[];

    setScheduledCourses(scheduled);
  }, [events, allCourses]);

  useEffect(() => {
    setCourses(() => {
      // Keep only unscheduled courses
      const scheduledCourseIds = events.map(e => e.courseId);
      return allCourses.filter(
        course => !scheduledCourseIds.includes(course.id),
      );
    });
  }, [allCourses, events]);

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
    console.log('handleDragEnd called');
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

  // console.log('new code - ' + termCode);

  const isAppliedCourseReSelected = () => {
    return !!allCourses.find(
      course =>
        course.name === majorSelected?.toUpperCase() + ' ' + numberSelected,
    );
  };

  const updateMajorSelectionMade = (value: string) => {
    setMajorSelected(value);
    if (numberSelected) {
      setNumberSelected(null);
    }
  };

  const updateNumberSelectionMade = (value: string | number) => {
    setNumberSelected(value);
  };

  const showConfirm = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
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

  const confirm = (courseKey: string, courseId: string) => () => {
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

  const cancel: PopconfirmProps['onCancel'] = e => {
    // console.log(e);
    e?.stopPropagation();
  };

  const showModal = (
    event: React.MouseEvent<HTMLSpanElement>,
    title: string,
    content?: React.ReactNode,
    modalProps?: ModalProps,
  ) => {
    event.stopPropagation();
    if (modalContent) {
      setModalContent({ title, content, modalProps });
    } else {
      setModalContent({
        title: 'Default title',
        content: <label>No modal data</label>,
      });
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const { data: majorNames } = useQuery<Option[], Error>({
    queryKey: ['majors', termCode],
    queryFn: () => fetchMajors(term.year, term.semester),
  });

  const { data: majorNumbers } = useQuery<Option[], Error>({
    queryKey: ['numbers', majorSelected, termCode],
    queryFn: () => {
      if (majorSelected)
        return fetchMajorCourses(term.year, term.semester, majorSelected);
      return Promise.resolve([]);
    },
    enabled: !!majorSelected, // Only run this query when a major is selected
  });

  const panelStyle: React.CSSProperties = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };

  const transformCourseData = (data: CourseOffering[]) => {
    return data.map(offering => {
      const { specificData } = offering;

      const lectures = offering.lectures.map(lecture => ({
        id: lecture.id,
        day: lecture.day,
        startTime: new Date(lecture.startTime),
        endTime: new Date(lecture.endTime),
      }));

      const labs = offering.labs.map(lab => ({
        id: lab.id,
        day: lab.day,
        startTime: new Date(lab.startTime),
        endTime: new Date(lab.endTime),
        section: lab.section,
      }));

      const tutorials = offering.tutorials.map(tut => ({
        id: tut.id,
        day: tut.day,
        startTime: new Date(tut.startTime),
        endTime: new Date(tut.endTime),
        section: tut.section,
      }));

      return {
        id: offering.associatedClass,
        lectures,
        labs,
        tutorials,
        specificData,
      };
    });
  };

  const onClickSearch = async () => {
    setLoading(true);
    const PreviewingCourseData = await queryClient.fetchQuery<
      CourseOffering[],
      Error
    >({
      queryKey: [term.year, term.semester, majorSelected, numberSelected],
      queryFn: () =>
        fetchCourseOfferings(
          term.year,
          term.semester,
          majorSelected,
          numberSelected,
        ),
    });
    setLoading(false);
    // console.log(JSON.stringify(PreviewingCourseData));
    // const fullCourseName = `${majorNames?.filter(major => majorSelected == major.value)[0].label} ${majorNumbers?.filter(number => number.value == numberSelected)[0].label}`;
    // setAppliedCourses(applied => [...applied, PreviewingCourseData[0]]);

    // Get the course identifier (you can use course key or any unique identifier)
    const courseKey = PreviewingCourseData[0].specificData.info.name; // Assuming `key` is a unique identifier for the course

    // Check if the course already has a color assigned
    let classColor = courseColorMapRef.current[courseKey];
    if (!classColor) {
      // Assign a new color from the available pool
      if (availableColorsRef.current.length > 0) {
        classColor = availableColorsRef.current.pop() as string; // Take a color from the end of the available list
        courseColorMapRef.current[courseKey] = classColor;
      } else {
        console.error('No available colors left!');
      }
    }

    const courseObj = {
      id: crypto.randomUUID(),
      className: classColor,
      name: PreviewingCourseData[0].specificData.info.name,
      availableOfferings: transformCourseData(PreviewingCourseData),
    } as Course;
    setAllCourses(all => [...all, courseObj]);
    // console.log(courseObj);
  };

  const onClickSave = (event: React.MouseEvent<HTMLSpanElement>) => {
    showModal(event, 'Save', <SaveInstancePage />, {
      okText: 'Confirm',
      onOk: () => {
        setIsModalOpen(false);
      },
    });
  };

  const onClickDeleteAll = () => {
    modal.warning({
      title: 'Delete all selections',
      content: <div>Delete all selections?</div>,
      onOk() {
        message.success('Deleted all');
        // Clear all courses
        setAllCourses([]);
        // Clear events
        setEvents([]);
        // Clear unscheduled courses
        setCourses([]);
        // Clear scheduled courses
        setScheduledCourses([]);
        // Reset dragging state
        handleDragEnd();
        sessionStorage.removeItem('schedule');

        allCourses.forEach(course => {
          const courseKey = course.name;
          const removedColor = courseColorMapRef.current[courseKey];
          if (removedColor) {
            availableColorsRef.current.push(removedColor);
            delete courseColorMapRef.current[courseKey];
          }
        });
      },
    });
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
            cancel={cancel}
            showConfirm={showConfirm}
            confirm={confirm}
          />
        ),
        children: <CourseItemContent course={course} />,
        style: itemPanelStyle,
      };
    });
  };

  const handleSemesterChange = (value: string) => {
    setTermCode(value);
  };

  // Function to handle remote offering selection
  const handleRemoteOfferingSelect = (courseId: string, offeringId: string) => {
    // Remove existing events for this course
    setEvents(prevEvents => prevEvents.filter(e => e.courseId !== courseId));

    // Remove the course from the course list
    setCourses(prevCourses => prevCourses.filter(c => c.id !== courseId));

    const course = allCourses.find(c => c.id === courseId);
    if (!course) return;

    const offering = course.availableOfferings.find(o => o.id === offeringId);
    if (!offering) return;

    // Create a placeholder event representing the remote offering
    const newEvent: CustomEvent = {
      id: `event-${courseId}-remote-${offering.id}`,
      className: course.className || '',
      title: `${course.name} (Remote)`,
      section: offering.specificData.info.section,
      start: new Date(), // Arbitrary date
      end: new Date(), // Arbitrary date
      allDay: true,
      courseId,
      offeringId,
      eventType: 'remote',
    };

    setEvents(prevEvents => [...prevEvents, newEvent]);
    setScheduledRemoteCourses(prev => [...prev, { course, offering }]);
    handleDragEnd(); // Reset dragging state
  };

  // Function to unschedule a remote course
  const handleRemoteCourseUnschedule = (courseId: string) => {
    setDraggingCourseId(null);
    // Remove the course from scheduled remote courses
    setScheduledRemoteCourses(prev =>
      prev.filter(item => item.course.id !== courseId),
    );

    // Remove the event from events
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

  // console.log(scheduledCourses);

  const semesterOptions =
    semesters?.map(sem => ({ value: sem.value, label: sem.label })) || [];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col flex-1 w-full items-center min-h-0 overflow-hidden">
        <div className="flex justify-center items-center gap-4 flex-wrap p-4 w-full flex-none">
          <Select
            defaultValue={termCode}
            className="w-32"
            onChange={handleSemesterChange}
            options={semesterOptions}
          />
          <Select
            showSearch
            style={{ width: 300 }}
            placeholder="Select major"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? '')
                .toLowerCase()
                .localeCompare((optionB?.label ?? '').toLowerCase())
            }
            options={majorNames}
            value={majorSelected}
            onSelect={updateMajorSelectionMade}
          />
          <Select
            showSearch
            style={{ width: 300 }}
            placeholder="Select course number"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? '')
                .toLowerCase()
                .localeCompare((optionB?.label ?? '').toLowerCase())
            }
            options={majorNumbers}
            disabled={!majorSelected}
            value={numberSelected}
            onSelect={updateNumberSelectionMade}
          />
          <Button
            type="primary"
            size="middle"
            disabled={
              !numberSelected || !majorSelected || isAppliedCourseReSelected()
            }
            onClick={onClickSearch}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-row flex-1 w-full overflow-hidden justify-center items-start min-h-0 px-6 pb-6 gap-4">
          <div className="flex flex-col flex-[3] justify-center min-h-0 h-full overflow-hidden gap-2">
            {/* <Calender termCode={termCode} events={appliedSchedule} /> */}
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
                      onClick={onClickSave}
                    />
                  </Tooltip>
                  <Tooltip title="Delete current schedule">
                    <CloseOutlined
                      style={{
                        cursor: 'pointer',
                        fontSize: CLOSE_ICON_SIZE,
                        color: 'grey',
                      }}
                      onClick={onClickDeleteAll}
                    />
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        </div>
        {contextHolder}
        {loading && <LoadingOverlay />}{' '}
        <Modal
          title={modalContent.title}
          open={isModalOpen}
          // onOk={handleOk}
          onCancel={handleCancel}
          closable={false}
          {...modalContent.modalProps}
          className="!w-full top-12"
        >
          {modalContent.content}
        </Modal>
      </div>
    </DndProvider>
  );
};

export default NewSchedulePage;

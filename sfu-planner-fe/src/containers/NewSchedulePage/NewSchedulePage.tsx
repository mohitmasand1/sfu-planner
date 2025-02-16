import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { SemesterData } from './types';
import LoadingOverlay from '../../components/Loading/LoadingOverlay';
import SearchControls from '../SearchControls/SearchControls';
import SchedulerSection from '../SchedulerSection/SchedulerSection';
import { useScheduler } from '../../hooks/useScheduler';

export interface NewSchedulePageProps {
  setTermCode: React.Dispatch<React.SetStateAction<string>>;
  termCode: string;
  semesters?: SemesterData[];
}

const NewSchedulePage: React.FC<NewSchedulePageProps> = props => {
  const { termCode, setTermCode, semesters } = props;
  const [loading, setLoading] = useState(false);

  const {
    term,
    allCourses,
    courses,
    events,
    scheduledCourses,
    scheduledRemoteCourses,
    addCourse,
    loadSchedule,
    scheduleRemoteCourse,
    scheduleInPersonCourse,
    switchLab,
    switchTutorial,
    unscheduleCourse,
    handleDeleteCourseFromList,
    handleScheduledDelete,
    clearAll,
    courseColorMapRef,
  } = useScheduler(termCode);

  const handleSemesterChange = (value: string) => {
    setTermCode(value);
    clearAll();
  };

  const onClickSearch = async (
    major: string | null | undefined,
    number: string | number | null | undefined,
  ) => {
    setLoading(true);
    await addCourse(major || '', number);
    setLoading(false);
  };

  const isAppliedCourseReSelected = (
    major: string | null | undefined,
    number: string | number | null | undefined,
  ) => {
    return !!allCourses.find(
      course =>
        course.name ===
        major?.toUpperCase() + ' ' + number?.toString().toUpperCase(),
    );
  };

  const semesterOptions =
    semesters?.map(sem => ({ value: sem.value, label: sem.label })) || [];

  console.log('allCourses - ', allCourses);
  console.log('courses - ', courses);
  console.log('scheduledCourses - ', scheduledCourses);
  console.log('scheduledRemoteCourses - ', scheduledRemoteCourses);
  console.log('events - ', events);

  console.log('TERMCODE IN NEWSCHEDULPAGE --', termCode);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col flex-1 w-full items-center min-h-0 overflow-hidden">
        <SearchControls
          termCode={termCode}
          semesterOptions={semesterOptions}
          onSemesterChange={handleSemesterChange}
          onClickSearch={onClickSearch}
          isAppliedCourseReSelected={isAppliedCourseReSelected}
        />
        <SchedulerSection
          term={term}
          setTermCode={setTermCode}
          allCourses={allCourses}
          events={events}
          courses={courses}
          scheduledRemoteCourses={scheduledRemoteCourses}
          scheduledCourses={scheduledCourses}
          scheduleInPersonCourse={scheduleInPersonCourse}
          scheduleRemoteCourse={scheduleRemoteCourse}
          switchLab={switchLab}
          switchTutorial={switchTutorial}
          unscheduleCourse={unscheduleCourse}
          handleDeleteCourseFromList={handleDeleteCourseFromList}
          handleScheduledDelete={handleScheduledDelete}
          loadSchedule={loadSchedule}
          clearAll={clearAll}
          courseColorMapRef={courseColorMapRef}
          setLoading={setLoading}
        />
        {loading && <LoadingOverlay />}{' '}
      </div>
    </DndProvider>
  );
};

export default NewSchedulePage;

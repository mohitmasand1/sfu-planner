// src/components/RemoteOfferingsDropzone.tsx

import React, { useState, useEffect } from 'react';
import { useDrop, useDrag } from 'react-dnd';

interface RemoteOfferingsDropzoneProps {
  allCourses: Course[];
  draggingCourseId: string | null;
  onRemoteOfferingSelect: (courseId: string, offeringId: string) => void;
  scheduledRemoteCourses: { course: Course; offering: Offering }[];
  onRemoteCourseUnschedule: (courseId: string) => void;
  onDragStart: (
    courseId: string,
    eventId?: string,
    eventType?: 'remote',
  ) => void;
  onDragEnd: () => void;
}

const RemoteOfferingsDropzone: React.FC<RemoteOfferingsDropzoneProps> = ({
  allCourses,
  draggingCourseId,
  onRemoteOfferingSelect,
  scheduledRemoteCourses,
  onRemoteCourseUnschedule,
  onDragStart,
  onDragEnd,
}) => {
  const [remoteOfferings, setRemoteOfferings] = useState<Offering[]>([]);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (draggingCourseId) {
      const course = allCourses.find(c => c.id === draggingCourseId);
      if (course) {
        const remoteOfferings = course.availableOfferings.filter(
          offering =>
            (!offering.lectures || offering.lectures.length === 0) &&
            (!offering.labs || offering.labs.length === 0) &&
            (!offering.tutorials || offering.tutorials.length === 0),
        );
        setRemoteOfferings(remoteOfferings);
        setCurrentCourse(course);
      }
    } else {
      setRemoteOfferings([]);
      setCurrentCourse(null);
    }
  }, [draggingCourseId, allCourses]);

  return (
    <div className="flex justify-center items-center flex-col border-2 border-dashed p-4 w-full">
      {draggingCourseId && currentCourse ? (
        remoteOfferings.length > 0 ? (
          <div className="flex flex-1 flex-wrap gap-4">
            {remoteOfferings.map(offering => (
              <RemoteOfferingItem
                key={offering.id}
                course={currentCourse}
                offering={offering}
                onRemoteOfferingSelect={onRemoteOfferingSelect}
              />
            ))}
          </div>
        ) : (
          <p className="flex-1">
            No remote offerings available for this course.
          </p>
        )
      ) : (
        <p className="flex-1">Remote course offerings will appear here</p>
      )}
      {scheduledRemoteCourses.length > 0 && (
        <div className="flex-1 mt-4">
          <div className="flex flex-wrap gap-4">
            {scheduledRemoteCourses.map(({ course, offering }) => (
              <ScheduledRemoteCourseItem
                key={course.id}
                course={course}
                offering={offering}
                onRemoteCourseUnschedule={onRemoteCourseUnschedule}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface RemoteOfferingItemProps {
  course: Course;
  offering: Offering;
  onRemoteOfferingSelect: (courseId: string, offeringId: string) => void;
}

const RemoteOfferingItem: React.FC<RemoteOfferingItemProps> = ({
  course,
  offering,
  onRemoteOfferingSelect,
}) => {
  const [{ isOver }, drop] = useDrop<
    { courseId: string; type: string },
    void,
    { isOver: boolean }
  >({
    accept: ['COURSE', 'SCHEDULED_COURSE', 'SCHEDULED_REMOTE_COURSE'],
    drop: item => {
      if (item.courseId === course.id) {
        onRemoteOfferingSelect(course.id, offering.id);
      }
    },
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`border p-2 cursor-pointer ${
        isOver ? 'bg-blue-100' : 'bg-white'
      }`}
      style={{ minWidth: '150px', textAlign: 'center' }}
    >
      Offering {offering.id}
    </div>
  );
};

interface ScheduledRemoteCourseItemProps {
  course: Course;
  offering: Offering;
  onRemoteCourseUnschedule: (courseId: string) => void;
  onDragStart: (
    courseId: string,
    eventId?: string,
    eventType?: 'remote',
  ) => void;
  onDragEnd: () => void;
}

const ScheduledRemoteCourseItem: React.FC<ScheduledRemoteCourseItemProps> = ({
  course,
  offering,
  onRemoteCourseUnschedule,
  onDragStart,
  onDragEnd,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'SCHEDULED_REMOTE_COURSE',
    item: { courseId: course.id, type: 'SCHEDULED_REMOTE_COURSE' },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    // console.log(`isDragging: ${isDragging}, courseId: ${course.id}`);
    if (isDragging) {
      onDragStart(course.id, undefined, 'remote');
    } else {
      onDragEnd();
    }
  }, [isDragging, course.id, onDragStart, onDragEnd]);

  return (
    <div
      ref={drag}
      className={`border p-2 cursor-pointer ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } ${course.className}`}
      style={{ minWidth: '150px', textAlign: 'center' }}
    >
      {course.name} {offering.specificData.info.section}
    </div>
  );
};

export default RemoteOfferingsDropzone;

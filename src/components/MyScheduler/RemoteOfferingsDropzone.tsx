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
        // Identify all remote offerings
        let remoteOfferings = course.availableOfferings.filter(
          offering =>
            (!offering.lectures || offering.lectures.length === 0) &&
            (!offering.labs || offering.labs.length === 0) &&
            (!offering.tutorials || offering.tutorials.length === 0),
        );

        // Find if there's already a scheduled remote offering
        const alreadyScheduled = scheduledRemoteCourses.find(
          item => item.course.id === draggingCourseId,
        );

        // Filter out the already scheduled offering
        if (alreadyScheduled) {
          remoteOfferings = remoteOfferings.filter(
            off => off.id !== alreadyScheduled.offering.id,
          );
        }

        setRemoteOfferings(remoteOfferings);
        setCurrentCourse(course);
      }
    } else {
      setRemoteOfferings([]);
      setCurrentCourse(null);
    }
  }, [draggingCourseId, allCourses, scheduledRemoteCourses]);

  return (
    <div className="flex justify-center items-center flex-col border-2 border-dashed p-3 w-full">
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
          <p className="flex-1 text-sm">
            No remote options available for this course
          </p>
        )
      ) : (
        <p className="flex-1 text-sm">Remote options will appear here</p>
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
      className={`p-1 cursor-pointer border-2 border-dashed rounded-lg ${
        isOver ? 'border-green-500 bg-green-100' : 'border-gray-400 bg-gray-200'
      }`}
      style={{ minWidth: '150px', textAlign: 'center' }}
    >
      <label className="text-center text-gray-700">{course.name} </label>
      <label className="text-center text-gray-700">
        {offering.specificData.info.section}
      </label>
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
  onDragStart,
  onDragEnd,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'SCHEDULED_REMOTE_COURSE',
    item: { courseId: course.id, type: 'SCHEDULED_REMOTE_COURSE' },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => onDragEnd(),
  });

  useEffect(() => {
    if (isDragging) {
      onDragStart(course.id, 'remote', 'remote');
    }
  }, [isDragging, course.id, onDragStart, onDragEnd]);

  return (
    <div
      ref={drag}
      className={`border border-gray-500 text-black rounded-lg p-1 cursor-pointer ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } ${course.className}`}
      style={{ minWidth: '150px', textAlign: 'center' }}
    >
      {course.name} {offering.specificData.info.section}
    </div>
  );
};

export default RemoteOfferingsDropzone;

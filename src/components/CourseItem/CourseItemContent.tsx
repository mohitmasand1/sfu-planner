import React from 'react';
import TextWithToggle from '../../components/TextWithToggle/TextWithToggle';
import { CourseOffering } from '../../containers/NewSchedulePage/fetch-course-data';

interface CourseItemContentProps {
  course: CourseOffering;
}

const CourseItemContent: React.FC<CourseItemContentProps> = props => {
  const { course } = props;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col">
        <label>
          <b>Course name:</b>
        </label>
        <label>{course.title}</label>
      </div>
      <div>
        <label>
          <b>Description:</b>
        </label>
        <TextWithToggle max={200} text={course.specificData.info.description} />
      </div>
      <div className="flex flex-col">
        <label>
          <b>Required Readings:</b>
        </label>
        <a
          className="text-sky-500"
          href="http://greenteapress.com/thinkpython2/thinkpython2.pdf"
          target="_blank"
        >
          Think Python - How to Think Like a Computer Scientist
        </a>
      </div>
    </div>
  );
};

export default CourseItemContent;

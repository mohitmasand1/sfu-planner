import React from 'react';
import { CourseOffering } from '../NewSchedulePage/fetch-course-data';

interface CourseSelectionPageProps {
  offerings?: CourseOffering[];
}

const CourseSelectionPage: React.FC<CourseSelectionPageProps> = props => {
  const { offerings } = props;
  return (
    <div className="flex flex-col">
      {offerings &&
        offerings.map(courseOfferings => (
          <label>{Object.values(courseOfferings).join(', ')}</label>
        ))}
    </div>
  );
};

export default CourseSelectionPage;

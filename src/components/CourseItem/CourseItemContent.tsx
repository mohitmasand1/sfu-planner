import React from 'react';
import {
  CourseOffering,
  fetchRateMyProfRating,
  ProfRating,
} from '../../containers/NewSchedulePage/fetch-course-data';
import { useQuery } from '@tanstack/react-query';
import { Spin } from 'antd';
import { BookOutlined, LoadingOutlined } from '@ant-design/icons';

interface CourseItemContentProps {
  course: CourseOffering;
}

const CourseItemContent: React.FC<CourseItemContentProps> = props => {
  const { course } = props;

  const professorDisplayName = course.specificData.professor[0]?.name || '';

  const { data: RMPRatingData, isLoading } = useQuery<ProfRating>({
    queryKey: [professorDisplayName],
    queryFn: () => fetchRateMyProfRating(professorDisplayName),
  });

  return (
    <div className="flex flex-row gap-3 justify-evenly">
      {/* <div className="flex flex-col">
        <label>
          <b>Course name:</b>
        </label>
        <label>{course.title}</label>
      </div> */}
      {/* <div>
        <label>
          <b>Description:</b>
        </label>
        <TextWithToggle max={200} text={course.specificData.info.description} />
      </div> */}
      <div className="flex flex-col">
        <label></label>
        <a
          className="text-sky-500 text-lg"
          href={`https://www.ratemyprofessors.com/search/professors/1482?q=${professorDisplayName}`}
          target="_blank"
        >
          {!isLoading ? (
            `${RMPRatingData?.rating || 'N/A'}/5`
          ) : (
            <Spin indicator={<LoadingOutlined spin />} size="small" />
          )}
        </a>
      </div>
      <div className="flex flex-col">
        <label></label>
        <a
          className="text-sky-500"
          href="http://greenteapress.com/thinkpython2/thinkpython2.pdf"
          target="_blank"
        >
          <BookOutlined />
        </a>
      </div>
    </div>
  );
};

export default CourseItemContent;

import React from 'react';
import {
  CourseGrade,
  CourseOffering,
  fetchAverageCourseGrade,
  fetchRateMyProfRating,
  ProfRating,
} from '../../containers/NewSchedulePage/fetch-course-data';
import { useQuery } from '@tanstack/react-query';
import { Statistic } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { convertToIsbn13 } from './isbn-converter';

interface CourseItemContentProps {
  course: CourseOffering;
}

const CourseItemContent: React.FC<CourseItemContentProps> = props => {
  const { course } = props;

  const professorDisplayName = course.specificData.professor[0]?.name || '';
  const courseName = course.specificData.info.name;
  const isbn = course.specificData.requiredText?.[0]?.isbn || '';
  const isbn13 = convertToIsbn13(isbn);

  const { data: RMPRatingData, isLoading: isRMPLoading } = useQuery<ProfRating>(
    {
      queryKey: [professorDisplayName],
      queryFn: () => fetchRateMyProfRating(professorDisplayName),
    },
  );

  const { data: courseAvgGrade, isLoading: isCAGLoading } =
    useQuery<CourseGrade>({
      queryKey: [courseName],
      queryFn: () => fetchAverageCourseGrade(courseName),
    });

  const rating = `${RMPRatingData?.rating || 'N/A'}/5`;
  console.log(isbn13);

  return (
    <div className="flex flex-row gap-3 justify-evenly">
      <div className="flex flex-col">
        <Statistic
          title={
            <div className="flex flex-col">
              <div className="flex flex-row gap-1">
                <label>Professor Rating</label>
                <a
                  href={`https://www.ratemyprofessors.com/search/professors/1482?q=${professorDisplayName}`}
                  target="_blank"
                >
                  <LinkOutlined />
                </a>
              </div>
              <label className="text-xs">RateMyProfessors.com</label>
            </div>
          }
          value={rating}
          loading={isRMPLoading}
          valueStyle={{ fontSize: '20px' }}
        />
      </div>
      <div className="flex flex-col">
        <Statistic
          title={
            <div className="flex flex-col">
              <div className="flex flex-row gap-1">
                <label>Average Grade</label>
                <a
                  href={`https://www.ratemyprofessors.com/search/professors/1482?q=${professorDisplayName}`}
                  target="_blank"
                >
                  <LinkOutlined />
                </a>
              </div>
              <label className="text-xs">CourseDiggers.com</label>
            </div>
          }
          loading={isCAGLoading}
          value={courseAvgGrade?.['median_grade'] || 'N/A'}
          valueStyle={{ fontSize: '20px' }}
        />
      </div>
      <div className="flex flex-col">
        <Statistic
          title={
            <div className="flex flex-col">
              <div className="flex flex-row gap-1">
                <label>Textbook ISBN</label>
                <a
                  href={`https://shop.sfu.ca/Item?item=${isbn13}`}
                  target="_blank"
                >
                  <LinkOutlined />
                </a>
              </div>
              <label className="text-xs">shop.sfu.ca</label>
            </div>
          }
          value={isbn13 == '' ? 'None' : isbn13}
          valueStyle={{ fontSize: '20px' }}
          groupSeparator=""
        />
      </div>
    </div>
  );
};

export default CourseItemContent;

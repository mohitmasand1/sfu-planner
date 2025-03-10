import React from 'react';
import { CourseGrade, ProfRating } from './types';
import { fetchAverageCourseGrade, fetchRateMyProfRating } from './http';
import { useQuery } from '@tanstack/react-query';
import { Statistic } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { convertToIsbn13 } from './isbn-converter';

const BACKEND_RMP_API_URL = import.meta.env.VITE_BACKEND_RMP_API_URL;
const COURSEDIGGERS_URL = import.meta.env.VITE_COURSEDIGGERS_URL;
const SFU_SHOP_URL = import.meta.env.VITE_SFU_SHOP_URL;

interface CourseItemContentProps {
  course: { course: Course; offering: Offering };
}

const CourseItemContent: React.FC<CourseItemContentProps> = props => {
  const { course } = props;
  const { specificData } = course.offering;
  const { info, professor, requiredText } = specificData;

  const professorDisplayName = professor[0]?.name || '';
  const courseName = info.name;
  const isbn = requiredText?.[0]?.isbn || '';
  const isbn13 = convertToIsbn13(isbn);

  const { data: RMPRatingData, isLoading: isRMPLoading } = useQuery<ProfRating>(
    {
      queryKey: [professorDisplayName],
      queryFn: () => fetchRateMyProfRating(professorDisplayName),
      enabled: professorDisplayName !== '',
    },
  );

  const { data: courseAvgGrade, isLoading: isCAGLoading } =
    useQuery<CourseGrade>({
      queryKey: [courseName],
      queryFn: () => fetchAverageCourseGrade(courseName),
    });

  const rating = RMPRatingData?.rating ? `${RMPRatingData.rating}/5` : 'N/A';
  // console.log(isbn13);

  return (
    <div className="flex flex-row gap-3 justify-evenly">
      <div className="flex flex-col">
        <Statistic
          title={
            <div className="flex flex-col">
              <div className="flex flex-row gap-1">
                <label>Professor Rating</label>
                <a
                  href={`${BACKEND_RMP_API_URL}?q=${professorDisplayName}`}
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
                <a href={COURSEDIGGERS_URL} target="_blank">
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
                <a href={`${SFU_SHOP_URL}?item=${isbn13}`} target="_blank">
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

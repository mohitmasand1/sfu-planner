import React from 'react';
import {
  CourseOffering,
  fetchRateMyProfRating,
  ProfRating,
} from '../../containers/NewSchedulePage/fetch-course-data';
import { Popconfirm, Flex, Spin } from 'antd';
import {
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';

const DELETE_ICON_SIZE = 18;

const deleteIconStyle: React.CSSProperties = {
  padding: 1,
  cursor: 'pointer',
  fontSize: DELETE_ICON_SIZE,
  color: 'grey',
};

interface CourseItemLabelProps {
  course: CourseOffering;
  handleLeftArrowClick: (event: React.MouseEvent<HTMLSpanElement>) => void;
  handleRightArrowClick: (event: React.MouseEvent<HTMLSpanElement>) => void;
  cancel?: (e?: React.MouseEvent<HTMLElement>) => void;
  showConfirm: (event: React.MouseEvent<HTMLSpanElement>) => void;
  confirm: (courseKey: string) => () => void;
}

const CourseItemLabel: React.FC<CourseItemLabelProps> = props => {
  const {
    course,
    handleLeftArrowClick,
    handleRightArrowClick,
    cancel,
    showConfirm,
    confirm,
  } = props;

  const professorDisplayName = course.specificData.professor[0]?.name || '';

  const { data: RMPRatingData, isLoading } = useQuery<ProfRating>({
    queryKey: [professorDisplayName],
    queryFn: () => fetchRateMyProfRating(professorDisplayName),
  });

  const courseKey = course.title;
  return (
    <div className="flex gap-3 pb-2">
      <div className="flex flex-col gap-1 w-full">
        <div className="flex justify-between items-center">
          <label>
            <b>{course.specificData.info.name}</b>
          </label>
          <label>{professorDisplayName}</label>
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label className="text-xs">{course.text}</label>
            <a
              className="text-sky-500 text-xs"
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
          <div className="flex justify-between">
            <label className="text-xs">
              {course.specificData.info?.units || 'N/A'} credits
            </label>
            <div className="flex gap-2">
              <LeftOutlined
                style={{
                  cursor: 'pointer',
                  color: 'grey',
                }}
                onClick={handleLeftArrowClick}
              />
              <RightOutlined
                style={{
                  cursor: 'pointer',
                  color: 'black',
                }}
                onClick={handleRightArrowClick}
              />
            </div>
            <label className="text-xs">
              {course.specificData?.schedule[0]?.campus} Campus
            </label>
          </div>
        </div>
      </div>
      {/* <div className=" h-fit bg-slate-200 w-px" /> */}
      <Popconfirm
        placement="left"
        title={`Remove ${course.specificData.info.name}?`}
        description="Are you sure to remove this course?"
        okText="Yes"
        cancelText="No"
        onConfirm={confirm(courseKey)}
        onCancel={cancel}
      >
        <DeleteOutlined style={deleteIconStyle} onClick={showConfirm} />
      </Popconfirm>
    </div>
  );
};

export default CourseItemLabel;

import React from 'react';
import { CourseOffering } from '../../containers/NewSchedulePage/fetch-course-data';
import { Popconfirm } from 'antd';
import { DeleteOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';

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

  const courseKey = course.title;
  return (
    <div className="flex gap-3 pb-2">
      <div className="flex flex-col gap-1 w-full">
        <div className="flex justify-between items-center">
          <label>
            <b>{course.specificData.info.name}</b>
          </label>
          <label>
            {course.specificData?.professor[0]?.firstName +
              ' ' +
              course.specificData?.professor[0]?.lastName}
          </label>
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label className="text-xs">{course.text}</label>
            <a
              className="text-sky-500 text-xs"
              href="http://greenteapress.com/thinkpython2/thinkpython2.pdf"
              target="_blank"
            >
              (4.6/5)
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

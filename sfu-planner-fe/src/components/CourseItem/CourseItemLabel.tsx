import React from 'react';
import { Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const DELETE_ICON_SIZE = 18;

const deleteIconStyle: React.CSSProperties = {
  padding: 1,
  cursor: 'pointer',
  fontSize: DELETE_ICON_SIZE,
  color: 'grey',
};

interface CourseItemLabelProps {
  course: { course: Course; offering: Offering };
  cancel?: (e?: React.MouseEvent<HTMLElement>) => void;
  showPopover: (event: React.MouseEvent<HTMLSpanElement>) => void;
  confirm: (courseKey: string, courseId: string) => () => void;
}

const CourseItemLabel: React.FC<CourseItemLabelProps> = props => {
  const { course, cancel, showPopover, confirm } = props;
  const { specificData } = course.offering;
  const { info, professor } = specificData;
  // console.log(course);

  const professorDisplayName = professor[0]?.name || '*TBD*';

  const courseKey = course.course.name;
  return (
    <div className="flex gap-3 pb-2">
      <div className="flex flex-col gap-1 w-full">
        <div className="flex justify-between items-center">
          <label>
            <a href={specificData.info.path} target="_blank">
              <b>
                {course.course.name} {specificData.info.section}
                {/* {course.specificData.info.name} {course.text} */}
              </b>
            </a>
          </label>
          <label>{professorDisplayName}</label>
        </div>
        <div>
          <div className="flex justify-between">
            <label className="text-xs">{info?.units || 'N/A'} credits</label>
            <div className="flex gap-2"></div>
            <label className="text-xs">Burnaby Campus</label>
          </div>
        </div>
      </div>
      {/* <div className=" h-fit bg-slate-200 w-px" /> */}
      <Popconfirm
        placement="left"
        title={`Remove ${info.name}?`}
        description="Are you sure to remove this course?"
        okText="Yes"
        cancelText="No"
        onConfirm={confirm(courseKey, course.course.id)}
        onCancel={cancel}
      >
        <DeleteOutlined style={deleteIconStyle} onClick={showPopover} />
      </Popconfirm>
    </div>
  );
};

export default CourseItemLabel;

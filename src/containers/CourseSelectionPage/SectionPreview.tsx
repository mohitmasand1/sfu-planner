import React from 'react';
import { Tabs } from 'antd';
import { CourseOffering } from '../NewSchedulePage/fetch-course-data';

interface SelectionPreviewProps {
  courseOffering: CourseOffering;
  tabKeys: { labtab?: string; tuttab?: string };
  onChangeLabTabKey: (newTabKey: string) => void;
  onChangeTutTabKey: (newTabKey: string) => void;
  majorSelected?: string | null;
  numberSelected?: string | number | null;
}

const SelectionPreview: React.FC<SelectionPreviewProps> = props => {
  const { courseOffering, onChangeLabTabKey, onChangeTutTabKey } = props;

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row justify-between">
        <label>Section: {courseOffering.text}</label>
        <label>
          Professor:
          {' ' +
            courseOffering?.specificData?.professor?.[0]?.firstName +
            ' ' +
            courseOffering?.specificData?.professor?.[0]?.lastName}
        </label>
        <label>{courseOffering?.specificData.info.units} credits</label>
      </div>
      {courseOffering.tutorials.length > 0 && (
        <Tabs
          onChange={(key: string) => onChangeTutTabKey(key)}
          type="card"
          // defaultActiveKey={courseOffering.tutorials[0].value}
          items={courseOffering.tutorials.map(tutorial => ({
            label: `${tutorial.text}`,
            key: tutorial.value,
            children: (
              <>
                {<label>{tutorial?.specificData?.schedule?.[0].start}</label>}
              </>
            ),
          }))}
        />
      )}
      {courseOffering.labs.length > 0 && (
        <Tabs
          onChange={(key: string) => onChangeLabTabKey(key)}
          type="card"
          defaultActiveKey={courseOffering.labs[0].value}
          items={courseOffering.labs.map(lab => ({
            label: `${lab.text}`,
            key: lab.value,
            children: (
              <>{<label>{lab?.specificData?.schedule?.[0].start}</label>}</>
            ),
          }))}
        />
      )}
    </div>
  );
};

export default SelectionPreview;

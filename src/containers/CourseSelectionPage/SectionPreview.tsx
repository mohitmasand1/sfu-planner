import React from 'react';
import { Tabs, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import {
  CourseOffering,
} from '../NewSchedulePage/fetch-course-data';

interface SelectionPreviewProps {
  courseOffering: CourseOffering;
  tabKey: string;
  onChangeTabKey: (newTabKey: string) => void;
  majorSelected?: string | null;
  numberSelected?: string | number | null;
}

const SelectionPreview: React.FC<SelectionPreviewProps> = props => {
  const {
    courseOffering,
    tabKey,
    onChangeTabKey,
    majorSelected,
    numberSelected,
  } = props;

  // useEffect(() => {
  //   // Initially trigger onChangeTabKey with the default tab key
  //   if (courseOffering.tutorials.length > 0) {
  //     onChangeTabKey(courseOffering.tutorials[0].value);
  //   } else if (courseOffering.labs.length > 0) {
  //     onChangeTabKey(courseOffering.labs[0].value);
  //   }
  // }, [onChangeTabKey, courseOffering, tabKey]);

  return (
    <div className="flex flex-col">
      <label>{courseOffering.text}</label>
      <label>{courseOffering?.specificData?.professor?.[0]?.firstName}</label>
      {courseOffering.tutorials.length > 0 && (
        <Tabs
          onChange={(key: string) => onChangeTabKey(key)}
          type="card"
          defaultActiveKey={courseOffering.tutorials[0].value}
          items={courseOffering.tutorials.map(tutorial => ({
            label: `${tutorial.text}`,
            key: tutorial.value,
            children: <>{<label>{tutorial?.specificData?.schedule?.[0].start}</label>}</>,
          }))}
        />
      )}
      {courseOffering.labs.length > 0 && (
        <Tabs
          onChange={(key: string) => onChangeTabKey(key)}
          type="card"
          defaultActiveKey={courseOffering.labs[0].value}
          items={courseOffering.labs.map(lab => ({
            label: `${lab.text}`,
            key: lab.value,
            children: <>{<label>{lab?.specificData?.schedule?.[0].start}</label>}</>,
          }))}
        />
      )}
    </div>
  );
};

export default SelectionPreview;

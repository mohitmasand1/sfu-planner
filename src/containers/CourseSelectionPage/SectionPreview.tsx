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
        <label>
          <b>{courseOffering.text}</b>
        </label>
        <div className="flex flex-col items-end">
          <label>{courseOffering?.specificData?.professor?.[0]?.name}</label>
          <label>{courseOffering?.specificData.info.units} credits</label>
        </div>
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
                {
                  <label>
                    Tutorial time:{' '}
                    {`${new Date(
                      tutorial?.specificData?.schedule?.[0].start,
                    ).toLocaleString('en-US', {
                      weekday: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })} - ${new Date(
                      tutorial?.specificData?.schedule?.[0].end,
                    ).toLocaleString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`}
                  </label>
                }
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
              <>
                {
                  <label>
                    Lab time:{' '}
                    {`${new Date(
                      lab?.specificData?.schedule?.[0].start,
                    ).toLocaleString('en-US', {
                      weekday: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })} - ${new Date(
                      lab?.specificData?.schedule?.[0].end,
                    ).toLocaleString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`}
                  </label>
                }
              </>
            ),
          }))}
        />
      )}
    </div>
  );
};

export default SelectionPreview;

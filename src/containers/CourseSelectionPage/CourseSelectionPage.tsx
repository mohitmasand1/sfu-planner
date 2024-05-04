import React, { useState } from 'react';
import { Tabs, Radio } from 'antd';
import type { RadioChangeEvent } from 'antd';

import { CourseOffering } from '../NewSchedulePage/fetch-course-data';
import Calender from '../../components/Calender/Calender';

interface CourseSelectionPageProps {
  offerings?: CourseOffering[];
}

const CourseSelectionPage: React.FC<CourseSelectionPageProps> = props => {
  const { offerings } = props;
  const [value, setValue] = useState(1);

  const onChange = (e: RadioChangeEvent) => {
    console.log('radio checked', e.target.value);
    setValue(e.target.value);
  };

  const onTabChange = (key: string) => {
    console.log(key);
  };

  return (
    <div className="flex flex-wrap gap-10">
      <div className="flex flex-1">
        <Calender termCode="1244" />
      </div>
      <div className="flex-1 min-w-[50%]">
        <Radio.Group
          className="flex flex-col gap-10"
          onChange={onChange}
          value={value}
        >
          <Radio value={1}>
            <div className="flex flex-col">
              <label>D100</label>
              <Tabs
                onChange={onTabChange}
                type="card"
                items={new Array(3).fill(null).map((_, i) => {
                  const id = String(i + 1);
                  return {
                    label: `TUT ${id}`,
                    key: id,
                    children: `Content of Tab Pane ${id}`,
                  };
                })}
              />
            </div>
          </Radio>
          <Radio value={2}>
            <div className="flex flex-col">
              <label>D200</label>
              <Tabs
                onChange={onTabChange}
                type="card"
                items={new Array(3).fill(null).map((_, i) => {
                  const id = String(i + 1);
                  return {
                    label: `LAB ${id}`,
                    key: id,
                    children: `Content of Tab Pane ${id}`,
                  };
                })}
              />
            </div>
          </Radio>
        </Radio.Group>

        {/* {offerings &&
          offerings.map(courseOfferings => (
            <label>{Object.values(courseOfferings).join(', ')}</label>
          ))} */}
      </div>
    </div>
  );
};

export default CourseSelectionPage;

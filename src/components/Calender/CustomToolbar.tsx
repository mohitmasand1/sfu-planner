import { ReloadOutlined } from '@ant-design/icons';
import { Radio } from 'antd';
import React from 'react';
import { Views } from 'react-big-calendar';

interface ToolbarProps {
  onNextClick: () => void;
  onPrevClick: () => void;
  onTodayClick: () => void;
  onResetClick: () => void;
  dateText: string;
}

type Keys = keyof typeof Views;

const CustomToolbar: React.FC<ToolbarProps> = props => {
  const { onNextClick, onPrevClick, onTodayClick, onResetClick, dateText } =
    props;
  return (
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center">
        <label className=" text-sm md:text-base font-semibold">
          {dateText}
        </label>
      </div>
      <Radio.Group>
        <Radio.Button value="large" onClick={onPrevClick}>
          {'<'}
        </Radio.Button>
        <Radio.Button value="default" onClick={onTodayClick}>
          Today
        </Radio.Button>
        <Radio.Button value="reset" onClick={onResetClick}>
          <ReloadOutlined />
        </Radio.Button>
        <Radio.Button value="small" onClick={onNextClick}>
          {'>'}
        </Radio.Button>
      </Radio.Group>
    </div>
  );
};

export default CustomToolbar;

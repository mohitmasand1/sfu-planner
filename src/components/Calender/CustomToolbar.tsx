import {
  ReloadOutlined,
  CaretLeftOutlined,
  CaretRightOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { Views } from 'react-big-calendar';

interface ToolbarProps {
  onNextClick: () => void;
  onPrevClick: () => void;
  onTodayClick: () => void;
  onResetClick: () => void;
  dateText: string;
}

type Keys = keyof typeof Views;

type SizeType = 'large' | 'middle' | 'small';

function useResponsiveButtonSize(): SizeType {
  const [size, setSize] = useState<SizeType>(() =>
    window.innerWidth < 768 ? 'small' : 'middle',
  );

  useEffect(() => {
    const handleResize = () => {
      setSize(window.innerWidth < 768 ? 'small' : 'middle');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

const CustomToolbar: React.FC<ToolbarProps> = props => {
  const { onNextClick, onPrevClick, onTodayClick, onResetClick, dateText } =
    props;

  const buttonSize = useResponsiveButtonSize();
  return (
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center">
        <label className=" text-sm md:text-base font-semibold">
          {dateText}
        </label>
      </div>
      <div className="flex gap-1">
        <Button
          icon={<CaretLeftOutlined />}
          type="primary"
          size={buttonSize}
          onClick={onPrevClick}
        ></Button>
        <Button type="primary" size={buttonSize} onClick={onTodayClick}>
          Today
        </Button>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={onResetClick}
          size={buttonSize}
        />
        <Button
          icon={<CaretRightOutlined />}
          type="primary"
          size={buttonSize}
          onClick={onNextClick}
        ></Button>
      </div>
    </div>
  );
};

export default CustomToolbar;

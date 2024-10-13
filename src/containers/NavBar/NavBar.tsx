import { DownloadOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import React from 'react';

interface NavBarProps {
  setTermCode: React.Dispatch<React.SetStateAction<string>>;
  termCode: string;
}

const NavBar: React.FC<NavBarProps> = () => {
  const Load_ICON_SIZE = 20;

  return (
    <div className="flex justify-between items-center w-full border-b bg-red-700 flex-none">
      <div className="flex flex-row p-4 text-white gap-6">
        <div>
          <label className="text-xl font-bold">SFU</label>{' '}
          <label>Scheduler</label>
        </div>
        <Button style={{ borderRadius: '15px' }} type="dashed">
          Instructions
        </Button>
      </div>
      <Tooltip title="Load schedule">
        <DownloadOutlined
          style={{
            cursor: 'pointer',
            fontSize: Load_ICON_SIZE,
            color: 'white',
            padding: '20px',
          }}
        />
      </Tooltip>
    </div>
  );
};

export default NavBar;

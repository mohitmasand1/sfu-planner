import { Button } from 'antd';
import React from 'react';
import { useModals } from '../../hooks/ModalsContext';
import Instructions from '../Instructions/Instructions';
import ExternalLinkOutlined from '@ant-design/icons';

interface NavBarProps {
  setTermCode: React.Dispatch<React.SetStateAction<string>>;
  termCode: string;
}

const NavBar: React.FC<NavBarProps> = () => {
  const { openModal, closeModal } = useModals();

  return (
    <div className="flex justify-between items-center w-full border-b bg-red-700 flex-none">
      <div className="flex flex-row p-4 text-white gap-6">
        <div>
          <label className="text-xl font-bold">SFU</label>{' '}
          <label>Scheduler</label>
        </div>
        <Button
          style={{ borderRadius: '15px' }}
          type="dashed"
          onClick={() =>
            openModal({
              title: 'Instructions',
              content: <Instructions />,
              footer: null,
            })
          }
        >
          Instructions
        </Button>
      </div>
      {/* <Button
        style={{ borderRadius: '15px', margin: '5px' }}
        type="dashed"
      >
        <a
          href=""
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-row items-center gap-1 text-blue-500 hover:text-blue-700 transition"
        >
          SFU API
          <ExternalLinkOutlined />
        </a>
      </Button> */}
      {/* <label className="p-5 text-white">SFU API</label> */}
      {/* <Tooltip title="Load schedule">
        <DownloadOutlined
          style={{
            cursor: 'pointer',
            fontSize: Load_ICON_SIZE,
            color: 'white',
            padding: '20px',
          }}
        />
      </Tooltip> */}
    </div>
  );
};

export default NavBar;

import React from 'react';
// import type { MenuProps } from 'antd';
// import { Select, Menu } from 'antd';
// import { Link, useLocation } from 'react-router-dom';
import Auth from '../../components/Authentication/Auth';

// const items: MenuProps['items'] = [
//   { key: 'create', label: <Link to="/create">Create</Link> },
//   { key: 'saved', label: <Link to="/saved">Saved</Link> },
//   { key: 'courseai', label: <Link to="/courseai">Course</Link> },
// ];

interface NavBarProps {
  setTermCode: React.Dispatch<React.SetStateAction<string>>;
  termCode: string;
}

const NavBar: React.FC<NavBarProps> = () => {
  // const { termCode, setTermCode } = props;
  // const location = useLocation();
  // const pathWithoutSlash = location.pathname.substring(1);
  // const [current, setCurrent] = useState(pathWithoutSlash);

  // const onClick: MenuProps['onClick'] = e => {
  //   setCurrent(e.key);
  // };

  // const handleSemesterChange = (value: string) => {
  //   setTermCode(value);
  // };

  return (
    <div className="flex justify-between items-center w-full border-b bg-red-600">
      <div className="p-3 text-white">
        <label className="text-xl font-bold">SFU</label> Scheduler
        {/* <Select
          defaultValue={termCode}
          className="sm:w-18 md:w-28 lg:w-32"
          onChange={handleSemesterChange}
          options={[
            { value: '1247', label: 'Fa24' },
            { value: '1251', label: 'Sp25' },
          ]}
        /> */}
      </div>
      {/* <Menu
        className="border-b-0"
        onClick={onClick}
        selectedKeys={[current]}
        mode="horizontal"
        // items={items}
      /> */}
      <Auth />
    </div>
  );
};

export default NavBar;

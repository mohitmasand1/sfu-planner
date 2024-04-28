import React, { useState } from 'react';
import type { MenuProps } from 'antd';
import { Menu, Avatar } from 'antd';
import { Link } from 'react-router-dom';

const items: MenuProps['items'] = [
  {
    key: 'new',
    label: <Link to="/create">New</Link>,
  },
  {
    key: 'saved',
    label: <Link to="/saved">Saved</Link>,
  },
  {
    key: 'ai',
    label: <Link to="/courseai">CourseAI</Link>,
  },
];

const NavBar: React.FC = () => {
  const [current, setCurrent] = useState('new');

  const onClick: MenuProps['onClick'] = e => {
    console.log('click ', e);
    setCurrent(e.key);
  };

  const url =
    'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

  return (
    <div className="flex justify-center items-center w-full">
      <Menu
        onClick={onClick}
        selectedKeys={[current]}
        mode="horizontal"
        items={items}
      />
      <div className="">
        <Avatar src={<img src={url} alt="avatar" />} />
      </div>
    </div>
  );
};

export default NavBar;

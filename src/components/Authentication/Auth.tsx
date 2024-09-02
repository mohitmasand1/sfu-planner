import { useGoogleLogin } from '@react-oauth/google';
import { useState, useEffect } from 'react';
import { Avatar, Dropdown, MenuProps } from 'antd';
import { getUserInfo, getLoggedInUser } from '../../auth/auth';
import { UserOutlined } from '@ant-design/icons';

export default function Auth() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check if user info is already in local storage when the component mounts
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoggedIn(true);
    }
  }, []);

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async codeResponse => {
      const loginDetails = await getUserInfo(codeResponse);

      // Save user info in state and local storage
      setLoggedIn(true);
      setUser(loginDetails.user);
      localStorage.setItem('user', JSON.stringify(loginDetails.user)); // Save user info in local storage
    },
  });

  const handleLogout = () => {
    setLoggedIn(false);
    setUser(null);
    localStorage.removeItem('user'); // Clear user info from local storage on logout
  };

  const items: MenuProps['items'] = [
    {
      key: '1',
      type: 'group',
      label: 'Account',
      children: [
        {
          key: '1-1',
          label: 'Login',
        },
        {
          key: '1-2',
          label: 'Signup',
        },
      ],
    },
  ];

  return (
    <div className="flex-none p-4">
      {loggedIn ? (
        <div>
          <p>{user.name}</p>
          <button onClick={handleLogout}>Log out</button>
        </div>
      ) : (
        <Dropdown menu={{ items }} trigger={['click']}>
          <Avatar
            style={{ verticalAlign: 'middle' }}
            size="large"
            icon={<UserOutlined />}
          />
        </Dropdown>
      )}
      {/* <button onClick={() => getLoggedInUser()}>Verify</button> */}
    </div>
  );
}

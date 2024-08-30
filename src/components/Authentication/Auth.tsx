import { useGoogleLogin } from '@react-oauth/google';
import { useState, useEffect } from 'react';
import { getUserInfo, getLoggedInUser } from '../../auth/auth';

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

  return (
    <div className="flex-none p-4">
      {loggedIn ? (
        <div>
          <p>{user.name}</p>
          <button onClick={handleLogout}>Log out</button>
        </div>
      ) : (
        <button onClick={() => googleLogin()}>Login</button>
      )}
      <button onClick={() => getLoggedInUser()}>Verify</button>
    </div>
  );
}

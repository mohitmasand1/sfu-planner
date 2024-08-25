import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { getUserInfo } from '../../auth/auth';

export default function Auth() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<any>({});
  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async codeResponse => {
      var loginDetails = await getUserInfo(codeResponse);
      setLoggedIn(true);
      setUser(loginDetails.user);
    },
  });

  const handleLogout = () => {
    setLoggedIn(false);
    setUser(false);
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
    </div>
  );
}

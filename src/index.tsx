import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import SavedSchedulePage from './containers/SavedSchedulePage/SavedSchedulePage';
import NewSchedulePage from './containers/NewSchedulePage/NewSchedulePage';
import CoursesAIPage from './containers/CourseAIPage/CourseAIPage';

import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <div>404 Not Found</div>,
    children: [
      {
        path: '/create',
        element: <NewSchedulePage />,
      },
      {
        path: '/saved',
        element: <SavedSchedulePage />,
      },
      {
        path: '/courseai',
        element: <CoursesAIPage />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <GoogleOAuthProvider clientId="335800261522-pi50uikomoskn0th8kt493sqmpt4lstl.apps.googleusercontent.com">
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </GoogleOAuthProvider>,
);

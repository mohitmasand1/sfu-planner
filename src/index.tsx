import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
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
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

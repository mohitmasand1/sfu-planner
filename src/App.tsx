import { Outlet } from 'react-router-dom';
import NavBar from './containers/NavBar/NavBar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const navItems = [
  { id: 'create', label: 'Create Schedule', path: '/create' },
  { id: 'saved', label: 'Saved Schedules', path: '/saved' },
  { id: 'courseAI', label: 'Course AI', path: '/courseai' },
];

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col w-full justify-center items-center h-full">
        <NavBar />
        <Outlet />
      </div>
    </QueryClientProvider>
  );
}

export default App;

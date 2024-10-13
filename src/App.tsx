// import { Outlet } from 'react-router-dom';
import NavBar from './containers/NavBar/NavBar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import NewSchedulePage from './containers/NewSchedulePage/NewSchedulePage';

function App() {
  const queryClient = new QueryClient();
  const [termCode, setTermCode] = useState<string>(() => {
    const savedData = localStorage.getItem('term');
    return savedData ? JSON.parse(savedData) : '1247';
  });

  useEffect(() => {
    localStorage.setItem('term', JSON.stringify(termCode));
  }, [termCode]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col w-screen h-screen items-center overflow-hidden">
        <NavBar termCode={termCode} setTermCode={setTermCode} />
        <NewSchedulePage termCode={termCode} setTermCode={setTermCode} />
      </div>
    </QueryClientProvider>
  );
}

export default App;

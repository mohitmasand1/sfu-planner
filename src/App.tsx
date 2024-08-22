import { Outlet } from 'react-router-dom';
import NavBar from './containers/NavBar/NavBar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

// TODO: Re-render calenders on termcode change

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
      <div className="flex flex-col w-full items-center md:h-screen md:max-h-screen overflow-hidden">
        <NavBar termCode={termCode} setTermCode={setTermCode} />
        <Outlet context={{ termCode }} />
      </div>
    </QueryClientProvider>
  );
}

export default App;

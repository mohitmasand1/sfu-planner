import NavBar from './containers/NavBar/NavBar';
import {
  useQuery,
} from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import NewSchedulePage from './containers/NewSchedulePage/NewSchedulePage';
import { fetchSemesters } from './containers/NewSchedulePage/http';
import { SemesterData } from './containers/NewSchedulePage/types';

function App() {

  const {
    data: semesters,
  } = useQuery<SemesterData[]>({
    queryKey: ['semesters'],
    queryFn: fetchSemesters,
  });

  const [termCode, setTermCode] = useState<string>(() => {
    const savedData = localStorage.getItem('term');
    return savedData ? JSON.parse(savedData) : '';
  });

  useEffect(() => {
    if (semesters && semesters.length > 0 && termCode === '') {
      setTermCode(semesters[0].value);
    }
  }, [semesters, termCode]);

  useEffect(() => {
    if (termCode) {
      localStorage.setItem('term', JSON.stringify(termCode));
    }
  }, [termCode]);

  return (
      <div className="flex flex-col w-screen h-screen items-center overflow-hidden">
        <NavBar termCode={termCode} setTermCode={setTermCode} />
        <NewSchedulePage
          termCode={termCode}
          setTermCode={setTermCode}
          semesters={semesters}
        />
      </div>
  );
}

export default App;
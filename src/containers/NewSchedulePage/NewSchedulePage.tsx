import React, { useState } from 'react';
import Search, { Option } from '../../components/Search';
import { Button, Divider } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { fetchMajors } from './fetchMajors';

const numbers = [
  {
    value: '100',
    label: '100',
  },
  {
    value: '101',
    label: '101',
  },
  {
    value: '102',
    label: '102',
  },
  {
    value: '103',
    label: '103',
  },
];

interface NewSchedulePageProps {}

const NewSchedulePage: React.FC<NewSchedulePageProps> = () => {
  const [majorSelected, setMajorSelected] = useState<boolean>(false);
  const [numberSelected, setNumberSelected] = useState<boolean>(false);

  const updateMajorSelectionMade = () => {
    setMajorSelected(true);
  };

  const updateNumberSelectionMade = () => {
    setNumberSelected(true);
  };

  const { data } = useQuery<Option[], Error>({
    queryKey: [],
    queryFn: () => fetchMajors('2024', 'spring'),
  });

  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <div className="flex justify-center items-center gap-4 flex-wrap grow m-4">
        <Search
          placeholder="Select major"
          data={data}
          onSelect={updateMajorSelectionMade}
        />
        <Search
          placeholder="Select course number"
          data={numbers}
          disabled={!majorSelected}
          onSelect={updateNumberSelectionMade}
        />
        <Button
          type="primary"
          size="middle"
          disabled={!numberSelected && !majorSelected}
        >
          Search
        </Button>
      </div>
      <div className="flex justify-center items-center gap-2 w-full h-full">
        <div className="h-full">calender</div>
        <Divider type="vertical" />
        <div className="h-full">list of selection</div>
      </div>
    </div>
  );
};

export default NewSchedulePage;

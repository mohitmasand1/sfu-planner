import { useState } from 'react';
import { Select } from 'antd';
import { Option } from '../NewSchedulePage/types';
import { useQuery } from '@tanstack/react-query';
import { fetchMajorCourses, fetchMajors } from '../NewSchedulePage/http';
import { parseTermCode } from '../../utils/parseTermCode';
import SFUButton from '../../components/Button/SFUButton';

const HeaderControls = ({
  termCode,
  semesterOptions,
  onSemesterChange,
  onClickSearch,
  isAppliedCourseReSelected,
}: {
  termCode: string;
  semesterOptions: { value: string; label: string }[];
  onSemesterChange: (value: string) => void;
  onClickSearch: (
    major: string | null | undefined,
    number: string | number | null | undefined,
  ) => void;
  isAppliedCourseReSelected: (
    major: string | null | undefined,
    number: string | number | null | undefined,
  ) => boolean;
}) => {
  const term = parseTermCode(termCode);
  const [majorSelected, setMajorSelected] = useState<string | null | undefined>(
    null,
  );
  const [numberSelected, setNumberSelected] = useState<
    string | number | null | undefined
  >(null);

  const { data: majorNames } = useQuery<Option[], Error>({
    queryKey: ['majors', termCode],
    queryFn: () => fetchMajors(term.year, term.semester),
  });

  const { data: majorNumbers } = useQuery<Option[], Error>({
    queryKey: ['numbers', majorSelected, termCode],
    queryFn: () => {
      if (majorSelected)
        return fetchMajorCourses(term.year, term.semester, majorSelected);
      return Promise.resolve([]);
    },
    enabled: !!majorSelected, // Only run this query when a major is selected
  });

  const handleSemesterChange = (value: string) => {
    setMajorSelected(null);
    setNumberSelected(null);
    onSemesterChange(value);
  };

  const updateMajorSelectionMade = (value: string) => {
    setMajorSelected(value);
    if (numberSelected) {
      setNumberSelected(null);
    }
  };

  const updateNumberSelectionMade = (value: string | number) =>
    setNumberSelected(value);

  const filterOption = (input: string, option?: Option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  const filterSort = (optionA: Option, optionB: Option) =>
    (optionA?.label ?? '')
      .toLowerCase()
      .localeCompare((optionB?.label ?? '').toLowerCase());

  const isAddDisabled =
    !numberSelected ||
    !majorSelected ||
    isAppliedCourseReSelected(majorSelected, numberSelected);

  return (
    <div className="flex justify-center items-center gap-4 flex-wrap p-4 w-full flex-none">
      <Select
        defaultValue={termCode}
        value={termCode}
        className="w-32"
        onChange={handleSemesterChange}
        options={semesterOptions}
      />
      <Select
        showSearch
        style={{ width: 300 }}
        placeholder="Select major"
        optionFilterProp="children"
        filterOption={filterOption}
        filterSort={filterSort}
        options={majorNames}
        value={majorSelected}
        onSelect={updateMajorSelectionMade}
      />
      <Select
        showSearch
        style={{ width: 300 }}
        placeholder="Select course number"
        optionFilterProp="children"
        filterOption={filterOption}
        filterSort={filterSort}
        options={majorNumbers}
        disabled={!majorSelected}
        value={numberSelected}
        onSelect={updateNumberSelectionMade}
      />
      {/* <Button
        className="bg-red-600"
        type="primary"
        size="middle"
        disabled={isAddDisabled}
        onClick={() => onClickSearch(majorSelected, numberSelected)}
      >
        Add
      </Button> */}
      <SFUButton
        size="middle"
        disabled={isAddDisabled}
        onClick={() => onClickSearch(majorSelected, numberSelected)}
      >
        Add
      </SFUButton>
    </div>
  );
};

export default HeaderControls;

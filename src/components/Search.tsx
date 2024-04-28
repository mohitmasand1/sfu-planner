import React from 'react';
import { Select } from 'antd';

export interface Option {
  value: string;
  label: string;
}

type SearchProps = {
  data?: Option[];
  placeholder: string;
  disabled?: boolean;
  onSelect?: () => void;
};

const Search: React.FC<SearchProps> = props => {
  const { data, placeholder, disabled = false, onSelect } = props;
  return (
    <div>
      <Select
        showSearch
        style={{ width: 200 }}
        placeholder={placeholder}
        optionFilterProp="children"
        filterOption={(input, option) => (option?.label ?? '').includes(input)}
        filterSort={(optionA, optionB) =>
          (optionA?.label ?? '')
            .toLowerCase()
            .localeCompare((optionB?.label ?? '').toLowerCase())
        }
        options={data}
        disabled={disabled}
        onSelect={onSelect}
      />
    </div>
  );
};

export default Search;

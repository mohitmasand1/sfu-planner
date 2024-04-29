import React from 'react';
import type { TableColumnsType } from 'antd';
import { Table } from 'antd';

interface SavedSchedulePageProps {}

interface DataType {
  key: React.Key;
  name: string;
  createdAt: string;
}

interface ExpandedDataType {
  key: React.Key;
  date: string;
  name: string;
}

const SavedSchedulePage: React.FC<SavedSchedulePageProps> = () => {
  const expandedRowRender = () => {
    const columns: TableColumnsType<ExpandedDataType> = [
      { title: 'Date', dataIndex: 'date', key: 'date' },
      { title: 'Name', dataIndex: 'name', key: 'name' },
    ];

    const data = [];
    for (let i = 0; i < 3; ++i) {
      data.push({
        key: i.toString(),
        date: '2014-12-24 23:12:00',
        name: 'This is production name',
      });
    }
    return <Table columns={columns} dataSource={data} pagination={false} />;
  };

  const columns: TableColumnsType<DataType> = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt' },
    { title: 'Action', key: 'operation', render: () => <a>Delete</a> },
  ];

  const data: DataType[] = [];
  for (let i = 0; i < 3; ++i) {
    data.push({
      key: i.toString(),
      name: 'Screen',
      createdAt: '2014-12-24 23:12:00',
    });
  }

  return (
    <div className="py-5">
      <Table
        className="w-[97vw] border"
        columns={columns}
        expandable={{ expandedRowRender, defaultExpandedRowKeys: ['0'] }}
        dataSource={data}
        pagination={false}
      />
    </div>
  );
};

export default SavedSchedulePage;

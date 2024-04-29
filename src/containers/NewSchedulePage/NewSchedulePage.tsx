import React, { useState, CSSProperties } from 'react';
import { Button, Collapse, Select, theme, Modal } from 'antd';
import type { CollapseProps } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { fetchMajorCourses, fetchMajors } from './fetchMajors';
import { CloudUploadOutlined, DeleteOutlined } from '@ant-design/icons';

export interface Option {
  value: string;
  label: string;
}

interface NewSchedulePageProps {}

const NewSchedulePage: React.FC<NewSchedulePageProps> = () => {
  const { token } = theme.useToken();

  const [majorSelected, setMajorSelected] = useState<
    string | number | null | undefined
  >(null);
  const [numberSelected, setNumberSelected] = useState<
    string | number | null | undefined
  >(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const updateMajorSelectionMade = (value: string | number) => {
    setMajorSelected(value);
  };

  const updateNumberSelectionMade = (value: string | number) => {
    setNumberSelected(value);
  };

  const showModal = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const { data: majorNames } = useQuery<Option[], Error>({
    queryKey: ['majors'],
    queryFn: () => fetchMajors('2024', 'spring'),
  });

  const { data: majorNumbers } = useQuery<Option[], Error>({
    queryKey: ['numbers', majorSelected],
    queryFn: () => fetchMajorCourses('2024', 'spring', majorSelected),
  });

  const panelStyle: React.CSSProperties = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };

  const getItems: (
    panelStyle: CSSProperties,
  ) => CollapseProps['items'] = panelStyle => [
    {
      key: '1',
      label: (
        <div className="flex gap-3">
          <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between items-center">
              <label>CMPT 120</label>
              <label>Gregory Baker</label>
            </div>
            <div className="flex">
              <label className="text-xs">Burnaby</label>
            </div>
          </div>
          {/* <div className=" h-fit bg-slate-200 w-px" /> */}
          <DeleteOutlined onClick={showModal} />
        </div>
      ),
      children: (
        <p>
          An elementary introduction to computing science and computer
          programming, suitable for students with little or no programming
          background. Students will learn fundamental concepts and terminology
          of computing science, acquire elementary skills for programming in a
          high-level language, e.g. Python. The students will be exposed to
          diverse fields within, and applications of computing science. Topics
          will include: pseudocode; data types and control structures;
          fundamental algorithms; recursion; reading and writing files;
          measuring performance of algorithms; debugging tools; basic terminal
          navigation using shell commands. Treatment is informal and programming
          is presented as a problem-solving tool. Students with credit for CMPT
          102, 128, 130 or 166 may not take this course for further credit.
          Students who have taken CMPT 125, 129, 130 or 135 first may not then
          take this course for further credit. Quantitative/Breadth-Science.
        </p>
      ),
      style: panelStyle,
    },
    {
      key: '2',
      label: (
        <div className="flex gap-3">
          <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between items-center">
              <label>CMPT 120</label>
              <label>Gregory Baker</label>
            </div>
            <div className="flex">
              <label className="text-xs">Burnaby</label>
            </div>
          </div>
          {/* <div className=" h-fit bg-slate-200 w-px" /> */}
          <DeleteOutlined onClick={showModal} />
        </div>
      ),
      children: (
        <p>
          A rigorous introduction to computing science and computer programming,
          suitable for students who already have some background in computing
          science and programming. Intended for students who will major in
          computing science or a related program. Topics include: memory
          management; fundamental algorithms; formally analyzing the running
          time of algorithms; abstract data types and elementary data
          structures; object-oriented programming and software design;
          specification and program correctness; reading and writing files;
          debugging tools; shell commands. Students with credit for CMPT 126,
          129, 135 or CMPT 200 or higher may not take this course for further
          credit. Quantitative.
        </p>
      ),
      style: panelStyle,
    },
    {
      key: '3',
      label: (
        <div className="flex gap-3">
          <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between items-center">
              <label>CMPT 120</label>
              <label>Gregory Baker</label>
            </div>
            <div className="flex">
              <label className="text-xs">Burnaby</label>
            </div>
          </div>
          {/* <div className=" h-fit bg-slate-200 w-px" /> */}
          <DeleteOutlined onClick={showModal} />
        </div>
      ),
      children: (
        <p>
          Introduction to a variety of practical and important data structures
          and methods for implementation and for experimental and analytical
          evaluation. Topics include: stacks, queues and lists; search trees;
          hash tables and algorithms; efficient sorting; object-oriented
          programming; time and space efficiency analysis; and experimental
          evaluation. Quantitative.
        </p>
      ),
      style: panelStyle,
    },
  ];

  return (
    <div className="flex flex-col justify-center items-center w-full h-full overflow-hidden">
      <div className="flex justify-center items-center gap-4 flex-wrap grow m-4">
        <Select
          showSearch
          style={{ width: 300 }}
          placeholder="Select major"
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label ?? '').includes(input)
          }
          filterSort={(optionA, optionB) =>
            (optionA?.label ?? '')
              .toLowerCase()
              .localeCompare((optionB?.label ?? '').toLowerCase())
          }
          options={majorNames}
          onSelect={updateMajorSelectionMade}
        />
        <Select
          showSearch
          style={{ width: 300 }}
          placeholder="Select course number"
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label ?? '').includes(input)
          }
          filterSort={(optionA, optionB) =>
            (optionA?.label ?? '')
              .toLowerCase()
              .localeCompare((optionB?.label ?? '').toLowerCase())
          }
          options={majorNumbers}
          disabled={!majorSelected}
          onSelect={updateNumberSelectionMade}
        />
        <Button
          type="primary"
          size="middle"
          disabled={!numberSelected || !majorSelected}
          onClick={showModal}
        >
          Search
        </Button>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-2 w-full h-full">
        <div className="flex h-full flex-1 grow justify-center min-w-96">
          calender
        </div>
        <div className="w-px bg-slate-600" />
        <div className="flex flex-col h-full flex-1 grow justify-center min-w-96 p-4 overflow-y-auto">
          <Collapse
            bordered={false}
            defaultActiveKey={['1']}
            style={{ background: token.colorBgContainer }}
            items={getItems(panelStyle)}
          />
          {getItems(panelStyle)?.length && (
            <CloudUploadOutlined
              className="self-center cursor-pointer"
              onClick={showModal}
            />
          )}
        </div>
      </div>
      <Modal
        title="Basic Modal"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    </div>
  );
};

export default NewSchedulePage;

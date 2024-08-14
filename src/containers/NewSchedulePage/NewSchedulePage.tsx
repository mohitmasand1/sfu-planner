import React, { useRef, useState } from 'react';
import {
  Button,
  Collapse,
  Select,
  theme,
  Modal,
  Tooltip,
  Popconfirm,
  message,
} from 'antd';
import type { CollapseProps, ModalProps, PopconfirmProps } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchMajorCourses,
  fetchMajors,
  fetchCourseOfferings,
  CourseOffering,
} from './fetch-course-data';
import {
  CloudUploadOutlined,
  DeleteOutlined,
  CloseOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import TextWithToggle from '../../components/TextWithToggle/TextWithToggle';
import CourseSelectionPage from '../CourseSelectionPage/CourseSelectionPage';
import SaveInstancePage from '../SaveInstanceModal/SaveInstancePage';
import Calender from '../../components/Calender/Calender';
import LoadingOverlay from '../../components/Loading/LoadingOverlay';

const DELETE_ICON_SIZE = 18;
const SAVE_ICON_SIZE = 20;
const CLOSE_ICON_SIZE = 18;

const colors = [
  'bg-selection-1',
  'bg-selection-2',
  'bg-selection-3',
  'bg-selection-4',
  'bg-selection-5',
  'bg-selection-6',
  'bg-selection-7',
  'bg-selection-8',
];

export interface Option {
  value: string;
  label: string;
}

interface modalData {
  title: string;
  content: React.ReactNode;
  modalProps?: ModalProps;
}

export interface SelectedCourseKey {
  key: string;
  lab: string;
  tut: string;
}

interface NewSchedulePageProps {}

const NewSchedulePage: React.FC<NewSchedulePageProps> = () => {
  // Create a ref to store the course-to-color mapping
  const courseColorMapRef = useRef<{ [key: string]: string }>({});
  const availableColorsRef = useRef<string[]>([...colors]); // Initially, all colors are available
  const queryClient = useQueryClient();
  const { token } = theme.useToken();
  const [modal, contextHolder] = Modal.useModal();

  const [majorSelected, setMajorSelected] = useState<string | null | undefined>(
    null,
  );
  const [numberSelected, setNumberSelected] = useState<
    string | number | null | undefined
  >(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<modalData>({
    title: '',
    content: <></>,
  });
  const [loading, setLoading] = useState(false);
  const [appliedCourses, setAppliedCourses] = useState<CourseOffering[]>([]);
  const [selectedCourseKey, setSelectedCourseKey] = useState<SelectedCourseKey>(
    {
      key: '',
      lab: '',
      tut: '',
    },
  );

  const updateMajorSelectionMade = (value: string) => {
    setMajorSelected(value);
    if (numberSelected) {
      setNumberSelected(null);
    }
  };

  const updateNumberSelectionMade = (value: string | number) => {
    setNumberSelected(value);
  };

  const handleRightArrowClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    // if enabled (not end of list), then change class and update enable/disable state
  };

  const handleLeftArrowClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    // if enabled (not end of list), then change class and update enable/disable state
  };

  const showConfirm = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
  };

  const confirm: PopconfirmProps['onConfirm'] = e => {
    console.log(e);
    e?.stopPropagation();
    message.success('Removed');
  };

  const cancel: PopconfirmProps['onCancel'] = e => {
    console.log(e);
    e?.stopPropagation();
  };

  const showModal = (
    event: React.MouseEvent<HTMLSpanElement>,
    title: string,
    content?: React.ReactNode,
    modalProps?: ModalProps,
  ) => {
    event.stopPropagation();
    if (modalContent) {
      setModalContent({ title, content, modalProps });
    } else {
      setModalContent({
        title: 'Default title',
        content: <label>No modal data</label>,
      });
    }
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    const PreviewingCourseData = queryClient.getQueryData<CourseOffering[]>([
      '2023',
      'fall',
      majorSelected,
      numberSelected,
    ]);
    if (PreviewingCourseData) {
      const selectedSection: CourseOffering =
        PreviewingCourseData.find(
          section => section.value === selectedCourseKey.key,
        ) || ({} as CourseOffering);
      selectedSection.labs = selectedSection.labs.filter(
        lab => lab.value === selectedCourseKey.lab,
      );
      selectedSection.tutorials = selectedSection.tutorials.filter(
        tut => tut.value === selectedCourseKey.tut,
      );
      setAppliedCourses(appliedCourses => [...appliedCourses, selectedSection]);
    }
    message.success('Saved');
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const { data: majorNames } = useQuery<Option[], Error>({
    queryKey: ['majors'],
    queryFn: () => fetchMajors('2023', 'fall'),
  });

  const { data: majorNumbers } = useQuery<Option[], Error>({
    queryKey: ['numbers', majorSelected],
    queryFn: () => {
      if (majorSelected)
        return fetchMajorCourses('2023', 'fall', majorSelected);
      return Promise.resolve([]);
    },
  });

  const panelStyle: React.CSSProperties = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };

  const deleteIconStyle: React.CSSProperties = {
    padding: 1,
    cursor: 'pointer',
    fontSize: DELETE_ICON_SIZE,
    color: 'grey',
  };

  const onClickSearch = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setLoading(true);
    const PreviewingCourseData = await queryClient.fetchQuery<
      CourseOffering[],
      Error
    >({
      queryKey: ['2023', 'fall', majorSelected, numberSelected],
      queryFn: () =>
        fetchCourseOfferings('2023', 'fall', majorSelected, numberSelected),
    });
    setLoading(false);
    console.log(JSON.stringify(PreviewingCourseData));
    const fullCourseName = `${majorNames?.filter(major => majorSelected == major.value)[0].label} ${majorNumbers?.filter(number => number.value == numberSelected)[0].label}`;
    showModal(
      event,
      fullCourseName,
      <CourseSelectionPage
        PreviewingCourseData={PreviewingCourseData}
        appliedSchedule={generateAppliedSchedule()}
        setSelectedCourse={setSelectedCourseKey}
        majorSelected={majorSelected}
        numberSelected={numberSelected}
      />,
      { okText: 'Add' },
    );
  };

  const onClickSave = (event: React.MouseEvent<HTMLSpanElement>) => {
    showModal(event, 'Save', <SaveInstancePage />, {
      okText: 'Confirm',
      onOk: () => {
        setIsModalOpen(false);
      },
    });
  };

  const onClickDeleteAll = (event: React.MouseEvent<HTMLSpanElement>) => {
    // showModal(
    //   event,
    //   'Delete all selections',
    //   <div>Delete all selections?</div>,
    //   { okText: 'Yes' },
    // );
    modal.warning({
      title: 'Delete all selections',
      content: <div>Delete all selections?</div>,
      onOk() {
        message.success('Deleted');
      },
    });
  };

  const generateAppliedSchedule = () => {
    return appliedCourses.flatMap(course => {
      // Get the course identifier (you can use course key or any unique identifier)
      const courseKey = course.title; // Assuming `key` is a unique identifier for the course

      // Check if the course already has a color assigned
      let classColor = courseColorMapRef.current[courseKey];
      if (!classColor) {
        // Assign a new color from the available pool
        if (availableColorsRef.current.length > 0) {
          classColor = availableColorsRef.current.pop() as string; // Take a color from the end of the available list
          courseColorMapRef.current[courseKey] = classColor;
        } else {
          console.error('No available colors left!');
        }
      }

      // Extract schedules and apply the color
      const courseSchedule = course.specificData.schedule.map(occ => ({
        title: occ.sectionCode,
        description: '',
        start: new Date(occ.start),
        end: new Date(occ.end),
        className: classColor,
      }));

      const labSchedule =
        course.labs[0]?.specificData.schedule.map(occ => ({
          title: occ.sectionCode,
          description: '',
          start: new Date(occ.start),
          end: new Date(occ.end),
          className: classColor,
        })) || [];

      const tutSchedule =
        course.tutorials[0]?.specificData.schedule.map(occ => ({
          title: occ.sectionCode,
          description: '',
          start: new Date(occ.start),
          end: new Date(occ.end),
          className: classColor,
        })) || [];

      // Combine all schedules
      return [...courseSchedule, ...labSchedule, ...tutSchedule];
    });
  };

  const getItems: (
    panelStyle: React.CSSProperties,
  ) => CollapseProps['items'] = panelStyle => {
    return appliedCourses.map((course, index) => ({
      key: index,
      label: (
        <div className="flex gap-3 pb-2">
          <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between items-center">
              <label>
                <b>{course.specificData.info.name}</b>
              </label>
              <label>Gregory Baker</label>
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs">{course.text}</label>
                <a
                  className="text-sky-500 text-xs"
                  href="http://greenteapress.com/thinkpython2/thinkpython2.pdf"
                  target="_blank"
                >
                  (4.6/5)
                </a>
              </div>
              <div className="flex justify-between">
                <label className="text-xs">3 credits</label>
                <div className="flex gap-2">
                  <LeftOutlined
                    style={{
                      cursor: 'pointer',
                      color: 'grey',
                    }}
                    onClick={handleLeftArrowClick}
                  />
                  <RightOutlined
                    style={{
                      cursor: 'pointer',
                      color: 'black',
                    }}
                    onClick={handleRightArrowClick}
                  />
                </div>
                <label className="text-xs">Burnaby</label>
              </div>
            </div>
          </div>
          {/* <div className=" h-fit bg-slate-200 w-px" /> */}
          <Popconfirm
            placement="left"
            title="Remove CMPT 120?"
            description="Are you sure to remove this course?"
            okText="Yes"
            cancelText="No"
            onConfirm={confirm}
            onCancel={cancel}
          >
            <DeleteOutlined style={deleteIconStyle} onClick={showConfirm} />
          </Popconfirm>
        </div>
      ),
      children: (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <label>
              <b>Course name:</b>
            </label>
            <label>{course.title}</label>
          </div>
          <div>
            <label>
              <b>Description:</b>
            </label>
            <TextWithToggle
              max={200}
              text={course.specificData.info.description}
            />
          </div>
          <div className="flex flex-col">
            <label>
              <b>Required Readings:</b>
            </label>
            <a
              className="text-sky-500"
              href="http://greenteapress.com/thinkpython2/thinkpython2.pdf"
              target="_blank"
            >
              Think Python - How to Think Like a Computer Scientist
            </a>
          </div>
        </div>
      ),
      style: panelStyle,
    }));
  };

  return (
    <div className="flex flex-col items-center w-full h-full md:max-h-[calc(100%-65px)] overflow-hidden">
      <div className="flex justify-center items-center gap-4 flex-wrap grow p-4">
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
          value={numberSelected}
          onSelect={updateNumberSelectionMade}
        />
        <Button
          type="primary"
          size="middle"
          disabled={!numberSelected || !majorSelected}
          onClick={onClickSearch}
        >
          Search
        </Button>
      </div>
      <div className="flex flex-wrap justify-center items-start gap-2 w-full h-full md:max-h-full">
        <div className="flex h-full flex-1 grow justify-center md:max-h-full p-4 md:p-7">
          <Calender termCode="1237" events={generateAppliedSchedule()} />
        </div>
        <div className="flex flex-col h-full md:max-h-full flex-1 justify-start min-w-96 p-4 md:p-7">
          <Collapse
            bordered={false}
            defaultActiveKey={['1']}
            style={{
              background: token.colorBgContainer,
              overflowY: 'auto',
            }}
            items={getItems(panelStyle)}
          />
          {getItems(panelStyle)?.length && (
            <div className="flex self-center gap-6">
              <Tooltip title="Save schedule">
                <CloudUploadOutlined
                  style={{
                    cursor: 'pointer',
                    fontSize: SAVE_ICON_SIZE,
                    color: 'grey',
                  }}
                  onClick={onClickSave}
                />
              </Tooltip>
              <Tooltip title="Delete all selections">
                <CloseOutlined
                  style={{
                    cursor: 'pointer',
                    fontSize: CLOSE_ICON_SIZE,
                    color: 'grey',
                  }}
                  onClick={onClickDeleteAll}
                />
              </Tooltip>
            </div>
          )}
        </div>
      </div>
      {contextHolder}
      {loading && <LoadingOverlay />}{' '}
      <Modal
        title={modalContent.title}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        closable={false}
        {...modalContent.modalProps}
        className="!w-full top-12"
      >
        {modalContent.content}
      </Modal>
    </div>
  );
};

export default NewSchedulePage;

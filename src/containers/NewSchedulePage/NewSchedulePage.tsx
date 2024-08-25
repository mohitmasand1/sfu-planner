import React, { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button, Collapse, Select, theme, Modal, Tooltip, message } from 'antd';
import type { CollapseProps, ModalProps, PopconfirmProps } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchMajorCourses,
  fetchMajors,
  fetchCourseOfferings,
  CourseOffering,
} from './fetch-course-data';
import { CloudUploadOutlined, CloseOutlined } from '@ant-design/icons';
import CourseSelectionPage from '../CourseSelectionPage/CourseSelectionPage';
import SaveInstancePage from '../SaveInstanceModal/SaveInstancePage';
import Calender from '../../components/Calender/Calender';
import LoadingOverlay from '../../components/Loading/LoadingOverlay';
import CourseItemLabel from '../../components/CourseItem/CourseItemLabel';
import CourseItemContent from '../../components/CourseItem/CourseItemContent';
import { parseTermCode } from '../../utils/parseTermCode';

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

interface SharedContext {
  termCode: string;
}

interface NewSchedulePageProps {}

const NewSchedulePage: React.FC<NewSchedulePageProps> = () => {
  const { termCode } = useOutletContext<SharedContext>();
  const term = parseTermCode(termCode);

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

  useEffect(() => {
    setAppliedCourses([]);
    setMajorSelected('');
    setNumberSelected('');
  }, [termCode]);

  console.log('new code - ' + termCode);
  console.log('new course list - ' + JSON.stringify(appliedCourses));

  const isAppliedCourseReSelected = () => {
    return !!appliedCourses.find(
      course =>
        course.specificData.info.major === majorSelected?.toUpperCase() &&
        course.specificData.info.number === numberSelected,
    );
  };

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

  const confirm = (courseKey: string) => () => {
    setAppliedCourses(prevCourses =>
      prevCourses.filter(course => course.title !== courseKey),
    );
    // Optionally restore the color to the available pool
    const removedColor = courseColorMapRef.current[courseKey];
    if (removedColor) {
      availableColorsRef.current.push(removedColor);
      delete courseColorMapRef.current[courseKey];
    }
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
      term.year,
      term.semester,
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
  });

  const panelStyle: React.CSSProperties = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };

  const onClickSearch = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setLoading(true);
    const PreviewingCourseData = await queryClient.fetchQuery<
      CourseOffering[],
      Error
    >({
      queryKey: [term.year, term.semester, majorSelected, numberSelected],
      queryFn: () =>
        fetchCourseOfferings(
          term.year,
          term.semester,
          majorSelected,
          numberSelected,
        ),
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
        termCode={termCode}
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

  const onClickDeleteAll = () => {
    modal.warning({
      title: 'Delete all selections',
      content: <div>Delete all selections?</div>,
      onOk() {
        message.success('Deleted all');
        setAppliedCourses([]);
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
        title: course.specificData.info.name,
        description: occ.sectionCode + ' ' + course.text,
        start: new Date(occ.start),
        end: new Date(occ.end),
        className: classColor,
      }));

      const labSchedule =
        course.labs[0]?.specificData.schedule.map(occ => ({
          title: course.specificData.info.name,
          description: occ.sectionCode + ' ' + course.labs[0].text,
          start: new Date(occ.start),
          end: new Date(occ.end),
          className: classColor,
        })) || [];

      const tutSchedule =
        course.tutorials[0]?.specificData.schedule.map(occ => ({
          title: course.specificData.info.name,
          description: occ.sectionCode + ' ' + course.tutorials[0].text,
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
    return appliedCourses.map((course, index) => {
      const courseKey = course.title;
      const courseColor = courseColorMapRef.current[courseKey];

      const itemPanelStyle: React.CSSProperties = {
        ...panelStyle,
        background: courseColor ? `var(--${courseColor})` : 'transparent',
      };
      return {
        key: index,
        label: (
          <CourseItemLabel
            course={course}
            handleLeftArrowClick={handleLeftArrowClick}
            handleRightArrowClick={handleRightArrowClick}
            cancel={cancel}
            showConfirm={showConfirm}
            confirm={confirm}
          />
        ),
        children: <CourseItemContent course={course} />,
        style: itemPanelStyle,
      };
    });
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
          value={majorSelected}
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
          disabled={
            !numberSelected || !majorSelected || isAppliedCourseReSelected()
          }
          onClick={onClickSearch}
        >
          Search
        </Button>
      </div>
      <div className="flex flex-wrap justify-center items-start gap-2 w-full h-full md:max-h-full">
        <div className="flex h-full flex-1 grow justify-center md:max-h-full p-4 md:p-7">
          <Calender termCode={termCode} events={generateAppliedSchedule()} />
        </div>
        <div className="flex flex-col h-full md:max-h-full flex-1 justify-start min-w-96 p-4 md:p-7">
          {appliedCourses.length > 0 && (
            <Collapse
              bordered={false}
              defaultActiveKey={['1']}
              style={{
                background: token.colorBgContainer,
                overflowY: 'auto',
              }}
              items={getItems(panelStyle)}
            />
          )}
          {(getItems(panelStyle)?.length || 0) > 0 && (
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

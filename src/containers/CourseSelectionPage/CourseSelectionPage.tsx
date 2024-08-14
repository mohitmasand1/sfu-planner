import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Radio } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { CourseOffering } from '../NewSchedulePage/fetch-course-data';
import Calender from '../../components/Calender/Calender';
import SelectionPreview from './SectionPreview';
import { Event } from 'react-big-calendar';
import { SelectedCourseKey } from '../NewSchedulePage/NewSchedulePage';

interface TabState {
  [key: string]: { labtab?: string; tuttab?: string };
}
interface CourseSelectionPageProps {
  majorSelected?: string | null;
  numberSelected?: string | number | null;
  setSelectedCourse: Dispatch<SetStateAction<SelectedCourseKey>>;
  PreviewingCourseData?: CourseOffering[];
  appliedSchedule?: Event[];
}

const CourseSelectionPage: React.FC<CourseSelectionPageProps> = props => {
  const {
    majorSelected = '',
    numberSelected = '',
    PreviewingCourseData = [],
    appliedSchedule = [],
    setSelectedCourse,
  } = props;
  console.log(`init lab value - ${PreviewingCourseData[0]?.labs[0]?.value}`);
  const [value, setValue] = useState<string>(PreviewingCourseData[0]?.value);
  console.log(`init value - ${value}`);
  const [tabStates, setTabStates] = useState<TabState>(() => {
    const initialState: TabState = {};
    PreviewingCourseData.forEach(course => {
      initialState[course.value] = {
        labtab: course.labs[0]?.value || '',
        tuttab: course.tutorials[0]?.value || '',
      };
    });
    return initialState;
  });

  console.log(`init tabStates - ${JSON.stringify(tabStates)}`);
  // const [selectedSectedData, setSelectedData] = useState<string>('');

  useEffect(() => {
    setValue(PreviewingCourseData[0]?.value);
    setTabStates(() => {
      const initialState: TabState = {};
      PreviewingCourseData.forEach(course => {
        initialState[course.value] = {
          labtab: course.labs[0]?.value || '',
          tuttab: course.tutorials[0]?.value || '',
        };
      });
      return initialState;
    });
    setSelectedCourse(course => ({
      ...course,
      key: PreviewingCourseData[0]?.value,
      lab: PreviewingCourseData[0]?.labs[0]?.value || '',
      tut: PreviewingCourseData[0]?.tutorials[0]?.value || '',
    }));
    console.log(
      'currently selected course key' + PreviewingCourseData[0]?.value,
    );
  }, [PreviewingCourseData]);

  const onSectionChange = (e: RadioChangeEvent) => {
    console.log('radio checked', e.target.value);
    setValue(e.target.value);
    setSelectedCourse(course => ({
      ...course,
      key: e.target.value,
      lab: tabStates[e.target.value].labtab || '',
      tut: tabStates[e.target.value].tuttab || '',
    }));
  };

  const handleLabTabChange = useCallback((id: string, newTabKey: string) => {
    console.log('tab checked', newTabKey);
    setTabStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        labtab: newTabKey,
      },
    }));
    setSelectedCourse(course => ({
      ...course,
      lab: newTabKey,
    }));
  }, []);

  const handleTutTabChange = useCallback((id: string, newTabKey: string) => {
    console.log('tab checked', newTabKey);
    setTabStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        tuttab: newTabKey,
      },
    }));
    setSelectedCourse(course => ({
      ...course,
      tut: newTabKey,
    }));
  }, []);

  const getPreviewScheduleFromSelection = () => {
    const selectedSectionData = PreviewingCourseData.find(
      section => section.value === value,
    );

    const createEvents = (schedule: any[], text: any) =>
      schedule.map(occ => ({
        title: occ.sectionCode,
        description: text,
        start: new Date(occ.start),
        end: new Date(occ.end),
      }));

    const schedule = selectedSectionData?.specificData?.schedule || [];
    const lecEvents = createEvents(schedule, selectedSectionData?.text);

    console.log(`tab state lab - ${tabStates[value]?.labtab}`);
    const labData = selectedSectionData?.labs.find(
      lab => lab.value === tabStates[value]?.labtab,
    );
    const labSchedule = labData?.specificData.schedule || [];
    const labEvents = createEvents(labSchedule, labData?.text);

    const tutData = selectedSectionData?.tutorials.find(
      tutorial => tutorial.value === tabStates[value]?.tuttab,
    );
    const tutSchedule = tutData?.specificData.schedule || [];
    const tutEvents = createEvents(tutSchedule, tutData?.text);

    console.log(`labEvents = ${JSON.stringify(labEvents)}`);

    return [...appliedSchedule, ...lecEvents, ...labEvents, ...tutEvents];
  };

  return (
    <div className="flex flex-wrap gap-10">
      <div className="flex flex-1">
        <Calender termCode="1237" events={getPreviewScheduleFromSelection()} />
      </div>
      <div className="flex-1 min-w-[50%] overflow-auto">
        <Radio.Group
          className="flex flex-col gap-10"
          onChange={onSectionChange}
          value={value}
          defaultValue={value}
        >
          {PreviewingCourseData?.map(courseOffering => (
            <Radio key={courseOffering.value} value={courseOffering.value}>
              <SelectionPreview
                courseOffering={courseOffering}
                tabKeys={tabStates[courseOffering.value]}
                onChangeLabTabKey={newTabKey =>
                  handleLabTabChange(courseOffering.value, newTabKey)
                }
                onChangeTutTabKey={newTabKey =>
                  handleTutTabChange(courseOffering.value, newTabKey)
                }
                majorSelected={majorSelected}
                numberSelected={numberSelected}
              />
            </Radio>
          ))}
        </Radio.Group>
      </div>
    </div>
  );
};

export default CourseSelectionPage;

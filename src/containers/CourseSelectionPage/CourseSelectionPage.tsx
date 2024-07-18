import React, { useState } from 'react';
import { Radio } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { useQuery, useQueries, UseQueryResult } from '@tanstack/react-query';
import {
  CourseOffering,
  CourseSection,
  fetchCourseOfferings,
  fetchCourseSection,
} from '../NewSchedulePage/fetch-course-data';
import Calender from '../../components/Calender/Calender';
import SelectionPreview from './SectionPreview';

interface TabState {
  [key: string]: string;
}
interface CourseSelectionPageProps {
  majorSelected?: string | null;
  numberSelected?: string | number | null;
}

const CourseSelectionPage: React.FC<CourseSelectionPageProps> = props => {
  const { majorSelected = '', numberSelected = '' } = props;
  const [value, setValue] = useState<string>('');
  const [tabStates, setTabStates] = useState<TabState>({});
  const [lastClickedTab, setLastClickedTab] = useState<string>('');

  const onSectionChange = (e: RadioChangeEvent) => {
    console.log('radio checked', e.target.value);
    setValue(e.target.value);
  };

  const handleTabChange = (id: string, newTabKey: string) => {
    setTabStates(prev => ({ ...prev, [id]: newTabKey }));
    setLastClickedTab(newTabKey);
  };

  const { data: courseOfferings = [] } = useQuery<CourseOffering[], Error>({
    // [{D100}, {D200}, {D300}]
    queryKey: ['courseOfferings', majorSelected, numberSelected],
    queryFn: () =>
      fetchCourseOfferings('2023', 'fall', majorSelected, numberSelected),
    placeholderData: [],
  });

  // const { data: selectedCourseOfferingData } = useQuery<CourseSection, Error>({
  //   queryKey: ['courseOfferings', majorSelected, numberSelected, value],
  //   queryFn: () => {
  //     if (value) {
  //       return fetchCourseSection(
  //         '2023',
  //         'fall',
  //         majorSelected,
  //         numberSelected,
  //         value,
  //       );
  //     }
  //     return Promise.resolve({} as CourseSection);
  //   },
  // });

  const results = useQueries({
    queries: courseOfferings.map(courseOffering => ({
      queryKey: [
        'courseOfferings',
        majorSelected,
        numberSelected,
        courseOffering.value,
      ],
      queryFn: () => {
        if (tabStates[courseOffering.value]) {
          return fetchCourseSection(
            '2023',
            'fall',
            majorSelected,
            numberSelected,
            tabStates[courseOffering.value],
          );
        }
        return Promise.resolve({} as CourseSection);
      },
    })),
  });

  const courseSections: (CourseSection | undefined)[] = results
    .map((result: UseQueryResult<CourseSection>) => result.data)
    .filter(Boolean);

  const { data: courseSection } = useQuery<CourseSection, Error>({
    queryKey: [
      'courseOfferings',
      majorSelected,
      numberSelected,
      lastClickedTab,
    ],
    queryFn: () => {
      if (lastClickedTab) {
        return fetchCourseSection(
          '2023',
          'fall',
          majorSelected,
          numberSelected,
          lastClickedTab,
        );
      }
      return Promise.resolve({} as CourseSection);
    },
  });

  const getCourseSectionEvents = () => {
    return courseSection?.schedule?.map(event => ({
      title: event.sectionCode,
      start: new Date(event.start),
      end: new Date(event.end),
    }));
  };

  /**
  [
    {
      info: {
        section: 'd100',
      }
    },
    // ...
  ]

  [
    {
      value: 'd100',
      // ...
    }
  ]
   */

  const getCombinedCourseList = () => {
    return courseSections.map(sectionInfo => {
      const sectionDetails = courseOfferings.find(
        sectionDetails => sectionDetails.value === sectionInfo?.info?.section,
      );
      return { sectionInfo, sectionDetails };
    });
  };

  console.log(JSON.stringify(getCombinedCourseList()));

  return (
    <div className="flex flex-wrap gap-10">
      <div className="flex flex-1">
        <Calender termCode="1237" events={getCourseSectionEvents()} />
      </div>
      <div className="flex-1 min-w-[50%] overflow-auto">
        <Radio.Group
          className="flex flex-col gap-10"
          onChange={onSectionChange}
          value={value}
        >
          {courseOfferings?.map(courseOffering => (
            <Radio key={courseOffering.value} value={courseOffering.value}>
              <SelectionPreview
                courseOffering={courseOffering}
                courseOfferingDetails={getCombinedCourseList().find(
                  a =>
                    a?.sectionInfo?.info?.section ===
                    courseOffering.value.toUpperCase(),
                )}
                tabKey={tabStates[courseOffering.value]}
                onChangeTabKey={newTabKey =>
                  handleTabChange(courseOffering.value, newTabKey)
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

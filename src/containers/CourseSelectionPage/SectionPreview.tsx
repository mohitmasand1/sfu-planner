import React, { useEffect } from 'react';
import { Tabs, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import {
  CourseOffering,
  CourseSection,
  fetchCourseSection,
} from '../NewSchedulePage/fetch-course-data';
import { useQuery } from '@tanstack/react-query';

interface CourseOfferingDetails {
  sectionInfo?: CourseSection;
  sectionDetails?: CourseOffering;
}

interface SelectionPreviewProps {
  courseOffering: CourseOffering;
  courseOfferingDetails?: CourseOfferingDetails;
  tabKey: string;
  onChangeTabKey: (newTabKey: string) => void;
  majorSelected?: string | null;
  numberSelected?: string | number | null;
}

const SelectionPreview: React.FC<SelectionPreviewProps> = props => {
  const {
    courseOffering,
    courseOfferingDetails,
    tabKey,
    onChangeTabKey,
    majorSelected,
    numberSelected,
  } = props;

  const { data: sectionData, isLoading } = useQuery<CourseSection>({
    queryKey: ['courseOfferings', majorSelected, numberSelected, tabKey],
    queryFn: () =>
      fetchCourseSection('2023', 'fall', majorSelected, numberSelected, tabKey),
  });

  useEffect(() => {
    // Initially trigger onChangeTabKey with the default tab key
    if (courseOffering.tutorials.length > 0) {
      onChangeTabKey(courseOffering.tutorials[0].value);
    } else if (courseOffering.labs.length > 0) {
      onChangeTabKey(courseOffering.labs[0].value);
    }
  }, []);

  console.log(JSON.stringify(courseOfferingDetails));

  return (
    <div className="flex flex-col">
      <label>{courseOffering.text}</label>
      <label>{courseOfferingDetails?.sectionInfo?.professor?.[0]?.firstName}</label>
      {courseOffering.tutorials.length > 0 && (
        <Tabs
          onChange={(key: string) => onChangeTabKey(key)}
          type="card"
          defaultActiveKey={courseOffering.tutorials[0].value}
          items={courseOffering.tutorials.map(tutorial => ({
            label: `${tutorial.text}`,
            key: tutorial.value,
            children: (
              <>
                {isLoading ? (
                  <Spin
                    indicator={
                      <LoadingOutlined style={{ fontSize: 24 }} spin />
                    }
                  />
                ) : (
                  <label>{sectionData?.schedule?.[0].start}</label>
                )}
              </>
            ),
          }))}
        />
      )}
      {courseOffering.labs.length > 0 && (
        <Tabs
          onChange={(key: string) => onChangeTabKey(key)}
          type="card"
          defaultActiveKey={courseOffering.labs[0].value}
          items={courseOffering.labs.map(lab => ({
            label: `${lab.text}`,
            key: lab.value,
            children: (
              <>
                {isLoading ? (
                  <Spin
                    indicator={
                      <LoadingOutlined style={{ fontSize: 24 }} spin />
                    }
                  />
                ) : (
                  <label>{sectionData?.schedule?.[0].start}</label>
                )}
              </>
            ),
          }))}
        />
      )}
    </div>
  );
};

export default SelectionPreview;

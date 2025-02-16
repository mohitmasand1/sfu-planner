import type { ModalProps } from 'antd';

export interface Option {
  value: string;
  label: string;
}

export interface modalData {
  title: string;
  content: React.ReactNode;
  modalProps?: ModalProps;
}

export interface SelectedCourseKey {
  key: string;
  lab: string;
  tut: string;
}

export interface Major {
  text: string;
  value: string;
  name: string;
}

export interface CourseNumber {
  text: string;
  value: string;
  title: string;
}

export interface CourseOffering {
  text: string;
  value: string;
  title: string;
  classType?: string;
  sectionCode?: string;
  associatedClass?: string;
  lectures: LectureTime[];
  tutorials: LabSession[];
  labs: LabSession[];
  specificData: CourseSection;
}

export interface Professor {
  firstName: string;
  lastName: string;
  name: string;
}

export interface Event {
  campus: string;
  sectionCode: string;
  start: string;
  end: string;
}

export interface Info {
  description: string;
  deliveryMethod: string;
  section: string;
  term: string;
  prerequisites: string;
  designation: string;
  title: string;
  name: string;
  major: string;
  number: string;
  units: string;
  corequisites: string;
  path: string;
}

export interface RequiredText {
  details: string;
  isbn?: string;
}

export interface SemesterData {
  value: string;
  label: string;
}

export interface SaveScheduleResponse {
  message: string;
};

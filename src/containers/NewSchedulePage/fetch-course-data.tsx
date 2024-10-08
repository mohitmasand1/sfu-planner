import { LabSession, LectureTime } from '../../components/MyScheduler/types';
import { Option } from './NewSchedulePage';

interface Major {
  text: string;
  value: string;
}

function convertToTermCode(year: string, term: string): string {
  // Extract the last two digits of the year
  const lastTwoDigits = year.slice(-2);

  // Map semester to its corresponding code
  const semesterCodeMap: Record<string, string> = {
    spring: '1',
    summer: '4',
    fall: '7',
  };

  // Get the code for the given semester
  const semesterCode = semesterCodeMap[term.toLowerCase()];

  // Construct the term code
  return `1${lastTwoDigits}${semesterCode}`;
}

export async function fetchMajors(
  year: string,
  term: string,
): Promise<Option[]> {
  const termCode = convertToTermCode(year, term);
  const response = await fetch(
    `http://localhost:5000/api/sfuapi?termCode=${termCode}`,
  );
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data: Major[] = await response.json();
  return data.map(item => ({
    label: item.text, // Assuming 'text' is the field you want to display
    value: item.value, // Keep the value field as is
  }));
}

interface CourseNumber {
  text: string;
  value: string;
  title: string;
}

export async function fetchMajorCourses(
  year: string,
  term: string,
  department: string | null | undefined,
): Promise<Option[]> {
  const termCode = convertToTermCode(year, term);
  const response = await fetch(
    `http://localhost:5000/api/sfuapi?termCode=${termCode}&major=${department}`,
  );
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data: CourseNumber[] = await response.json();
  return data.map(item => ({
    label: `${item.value} - ${item.title}`, // Assuming 'text' is the field you want to display
    value: item.value, // Keep the value field as is
  }));
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

export async function fetchCourseOfferings(
  year: string,
  term: string,
  department: string | null | undefined,
  courseNumber: string | number | null | undefined,
): Promise<CourseOffering[]> {
  const termCode = convertToTermCode(year, term);
  const response = await fetch(
    `http://localhost:5000/api/sfuapi?termCode=${termCode}&major=${department}&course=${courseNumber}`,
  );
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data: CourseOffering[] = await response.json();
  return data;
}

interface Professor {
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

interface Info {
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
}

interface RequiredText {
  details: string;
  isbn?: string;
}

export interface CourseSection {
  professor: Professor[];
  schedule: Event[];
  info: Info;
  requiredText: RequiredText[];
}

export async function fetchCourseSection(
  year: string,
  term: string,
  department: string | null | undefined,
  courseNumber: string | number | null | undefined,
  courseSection: string | null | undefined,
): Promise<CourseSection> {
  const termCode = convertToTermCode(year, term);
  const response = await fetch(
    `http://localhost:5000/api/sfuapi?termCode=${termCode}&major=${department}&course=${courseNumber}&section=${courseSection}`,
  );
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data: CourseSection = await response.json();
  return data;
}

export interface ProfRating {
  department?: string;
  difficulty?: number;
  name?: string;
  num_ratings?: number;
  rating?: number;
}

export async function fetchRateMyProfRating(name: string): Promise<ProfRating> {
  const response = await fetch(`http://localhost:5000/api/rmp?name=${name}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data: ProfRating = await response.json();
  return data;
}

export interface CourseGrade {
  _id: string;
  a_minus_percentage: number;
  a_percentage: number;
  a_plus_percentage: number;
  b_minus_percentage: number;
  b_percentage: number;
  b_plus_percentage: number;
  c_grade_percentage: number;
  c_minus_percentage: number;
  c_plus_percentage: number;
  course_name: string;
  d_percentage: number;
  fail_rate: number;
  median_grade: string;
}

export async function fetchAverageCourseGrade(
  course: string,
): Promise<CourseGrade> {
  const response = await fetch(`http://localhost:5000/api/cd?course=${course}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data: CourseGrade = await response.json();
  return data;
}

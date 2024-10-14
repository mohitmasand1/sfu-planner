import { convertToTermCode } from './termcode-converter';
import { Option, Major, CourseNumber, CourseOffering } from './types'

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
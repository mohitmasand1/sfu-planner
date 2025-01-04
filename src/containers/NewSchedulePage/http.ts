import { convertToTermCode } from './termcode-converter';
import { Option, Major, CourseNumber, CourseOffering, SemesterData, SaveScheduleResponse } from './types'

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
    return data.filter(item => item.name !== undefined).map(item => ({
      label: item.text + " - " + item.name, // Assuming 'text' is the field you want to display
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
    return data.filter(item => item.title !== undefined).map(item => ({
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

  export const fetchSemesters = async (): Promise<SemesterData[]> => {
    const response = await fetch('http://localhost:5000/api/terms/terms'); // Adjust URL if hosted differently
    if (!response.ok) {
      throw new Error(`Error fetching semesters: ${response.statusText}`);
    }
    return await response.json();
  };

  export async function fetchOnLoad(): Promise<GetResponse> {
    const response = await fetch('http://localhost:5000/api/user/uuid', {
      method: 'GET',
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
  
    // Adjust the return type based on your actual API response
    return (await response.json()) as GetResponse;
  }

  export async function saveSchedule(scheduleData: { name: string; course_ids: CourseIDs[] }): Promise<SaveScheduleResponse> {
    const response = await fetch('http://localhost:5000/api/user/save', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scheduleData),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save schedule');
    }
  
    return response.json();
  };

  export async function getSchedules(): Promise<ScheduleResponse[]> {
    const response = await fetch('http://localhost:5000/api/user', {
      method: 'GET',
      credentials: 'include',
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
  
    // Adjust the return type based on your actual API response
    return (await response.json()) as ScheduleResponse[];
  }
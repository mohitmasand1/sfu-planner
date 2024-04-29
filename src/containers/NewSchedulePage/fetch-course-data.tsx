import { Option } from './NewSchedulePage';

interface CourseOutline {
  text: string;
  value: string;
}

export async function fetchMajors(
  year: string,
  term: string,
): Promise<Option[]> {
  const response = await fetch(
    `http://www.sfu.ca/bin/wcm/course-outlines?${year}/${term}`,
  );
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data: CourseOutline[] = await response.json();
  return data.map(item => ({
    label: item.text, // Assuming 'text' is the field you want to display
    value: item.value, // Keep the value field as is
  }));
}

interface CourseOutline {
  text: string;
  value: string;
  title: string;
}

export async function fetchMajorCourses(
  year: string,
  term: string,
  department: string | number | null | undefined,
): Promise<Option[]> {
  const response = await fetch(
    `http://www.sfu.ca/bin/wcm/course-outlines?${year}/${term}/${department}`,
  );
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data: CourseOutline[] = await response.json();
  return data.map(item => ({
    label: `${item.value} - ${item.title}`, // Assuming 'text' is the field you want to display
    value: item.value, // Keep the value field as is
  }));
}

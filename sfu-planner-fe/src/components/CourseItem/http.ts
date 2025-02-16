import { CourseGrade, ProfRating } from "./types";

export async function fetchRateMyProfRating(name: string): Promise<ProfRating> {
    const response = await fetch(`http://localhost:5000/api/rmp?name=${name}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: ProfRating = await response.json();
    return data;
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
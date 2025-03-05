import { CourseGrade, ProfRating } from "./types";

const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export async function fetchRateMyProfRating(name: string): Promise<ProfRating> {
    const response = await fetch(`${BACKEND_API_BASE_URL}/rmp?name=${name}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: ProfRating = await response.json();
    return data;
  }

export async function fetchAverageCourseGrade(
    course: string,
  ): Promise<CourseGrade> {
    const response = await fetch(`${BACKEND_API_BASE_URL}/cd?course=${course}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: CourseGrade = await response.json();
    return data;
  }
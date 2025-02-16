export interface ProfRating {
    department?: string;
    difficulty?: number;
    name?: string;
    num_ratings?: number;
    rating?: number;
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
export {};

declare global {
    interface CourseSection {
        professor: Professor[];
        schedule: Event[];
        info: Info;
        requiredText: RequiredText[];
    }

    interface Offering {
        className?: string,
        id: string;
        path: string;
        lectures: LectureTime[];
        labs?: LabSession[]; // Optional labs
        tutorials?: TutorialSession[];
        specificData: CourseSection;
    }

    interface Course {
        id: string;
        className?: string;
        name: string;
        availableOfferings: Offering[];
    }
    
    interface LectureTime {
        id: string;
        day: number; // 0 (Sunday) to 6 (Saturday)
        startTime: Date; // Only time is relevant
        endTime: Date;
    }

    interface LabSession {
        id: string;
        day: number;
        startTime: Date;
        endTime: Date;
        section: string;
    }

    interface GetResponse {
        message: string;
        data: CourseIDs[];
    }

    interface CourseIDs {
        offering: string;
        lab?: string;
        tutorial?: string;
    }

    interface ScheduleResponse {
        name: string;
        course_ids: CourseIDs[];
    }

}
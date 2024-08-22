export function parseTermCode(termCode: string): {
  semester: string;
  year: string;
} {
  // Extract century, year, and semester code
  const yearCode = termCode.slice(1, 3);
  const semesterCode = termCode.charAt(3);

  // Determine the full year
  const year = (2000 + parseInt(yearCode, 10)).toString();

  // Determine the semester
  let semester: string;
  switch (semesterCode) {
    case '1':
      semester = 'Spring';
      break;
    case '4':
      semester = 'Summer';
      break;
    case '7':
      semester = 'Fall';
      break;
    default:
      semester = 'Spring'; // Invalid semester code
  }

  return { semester, year };
}

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

export function generateTermCode(semester: string, year: string): string {
  // Extract the last two digits of the year
  const yearCode = year.slice(-2);

  // Determine the semester code
  let semesterCode: string;
  switch (semester.toLowerCase()) {
    case 'spring':
      semesterCode = '1';
      break;
    case 'summer':
      semesterCode = '4';
      break;
    case 'fall':
      semesterCode = '7';
      break;
    default:
      throw new Error('Invalid semester. Use "Spring", "Summer", or "Fall".');
  }

  // Construct the term code (assuming '1' as the century prefix for 2000s)
  return `1${yearCode}${semesterCode}`;
}

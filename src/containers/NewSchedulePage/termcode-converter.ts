
export function convertToTermCode(year: string, term: string): string {
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
export function convertToIsbn13(isbn: string): string {
    isbn = isbn.replace(/-/g, '');  // Remove any hyphens

    // If it's already ISBN-13, return it as is
    if (/^\d{13}$/.test(isbn)) {
        return isbn;
    }

    // Convert ISBN-10 to ISBN-13
    if (/^\d{9}[\dX]$/.test(isbn)) {
        const prefix = '978';  // All ISBN-13 for books starts with 978
        const isbn13WithoutCheck = prefix + isbn.slice(0, -1);

        // Calculate the ISBN-13 check digit
        const total = isbn13WithoutCheck
            .split('')
            .map((digit, index) => (index % 2 === 0 ? 1 : 3) * parseInt(digit))
            .reduce((acc, curr) => acc + curr, 0);

        const checkDigit = (10 - (total % 10)) % 10;
        return isbn13WithoutCheck + checkDigit.toString();
    }

    return ''
}
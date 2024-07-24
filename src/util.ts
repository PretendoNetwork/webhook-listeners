export function ordinal(num: number): string {
	const ones = num % 10;
	const tens = num % 100;

	if (ones === 1 && tens !== 11) {
		return num + 'st';
	}

	if (ones === 2 && tens !== 12) {
		return num + 'nd';
	}

	if (ones === 3 && tens !== 13) {
		return num + 'rd';
	}

	return num + 'th';
}
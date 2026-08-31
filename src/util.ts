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

const byteUnits = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

export function formatBytes(bytes: number, decimals = 2): string {
	if (bytes === 0) return '0 Bytes';
	if (bytes < 1 || !Number.isFinite(bytes)) return '0 Bytes';

	const base = 1024;
	const unitIndex = Math.floor(Math.log(bytes) / Math.log(base)); // log base 1024 of bytes
	const value = bytes / Math.pow(base, unitIndex);
	return value.toFixed(decimals) + ' ' + byteUnits[unitIndex];
}
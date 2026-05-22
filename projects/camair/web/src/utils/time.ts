/**
 * Format a UTC date string to UTC+7 timezone
 * @param dateString - ISO string (e.g., "2024-01-15T10:00:00Z")
 * @param format - output format (default: "YYYY-MM-DD HH:mm:ss")
 * @returns formatted date string in UTC+7
 */
function formatToUTC7(
  dateString: string,
  format: string = "YYYY-MM-DD HH:mm:ss",
): string {
  const date = new Date(dateString);

  // UTC+7 offset in milliseconds
  const utc7Offset = 7 * 60 * 60 * 1000;
  const utc7Date = new Date(date.getTime() + utc7Offset);

  const year = utc7Date.getUTCFullYear();
  const month = String(utc7Date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(utc7Date.getUTCDate()).padStart(2, "0");
  const hours = String(utc7Date.getUTCHours()).padStart(2, "0");
  const minutes = String(utc7Date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(utc7Date.getUTCSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}

// Alternative: Using Intl.DateTimeFormat (more robust)
function formatToUTC7Intl(date: Date): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok", // UTC+7
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return formatter.format(date);
}

// "Monday, January 15, 2024 at 17:00:00 GMT+7"

export { formatToUTC7, formatToUTC7Intl };

export function isValidDate(dateValue) {
  if (typeof dateValue !== 'string') {
    return false;
  }

  const date = new Date(dateValue);

  return !Number.isNaN(date.getTime());
}

export function sortByDateAscending(observations) {
  return [...observations].sort(
    (first, second) =>
      new Date(first.date).getTime() - new Date(second.date).getTime(),
  );
}
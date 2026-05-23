interface MonthYear {
  month: number;
  year: number;
}

export function getMonthsBetweenDates(
  startDate: Date,
  endDate: Date,
): MonthYear[] {
  if (startDate > endDate) {
    throw new Error('Start date must be before or equal to end date');
  }

  const resultado: MonthYear[] = [];
  let currentYear = startDate.getFullYear();
  let currentMonth = startDate.getMonth() + 1;
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth() + 1;

  while (
    currentYear < endYear ||
    (currentYear === endYear && currentMonth <= endMonth)
  ) {
    resultado.push({ month: currentMonth, year: currentYear });
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  return resultado;
}

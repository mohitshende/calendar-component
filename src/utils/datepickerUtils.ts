type Weekends = string[];

// Predefined ranges
export const getPredefinedDateRanges = (): {
  label: string;
  range: [Date, Date];
}[] => [
  {
    label: "Today",
    range: [new Date(), new Date()],
  },
  {
    label: "This Week",
    range: [
      new Date(new Date().setDate(new Date().getDate() - new Date().getDay())),
      new Date(),
    ],
  },
  {
    label: "Last 7 Days",
    range: [new Date(new Date().setDate(new Date().getDate() - 6)), new Date()],
  },
  {
    label: "Last Month",
    range: [
      new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
      new Date(new Date().getFullYear(), new Date().getMonth(), 0),
    ],
  },
];

// Helper: Normalize a date to midnight (local time zone)
export const normalizeDate = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

// Helper: Format date as "YYYY-MM-DD"
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper: Parse date from "YYYY-MM-DD"
export const parseDate = (dateString: string): Date | null => {
  const parts = dateString.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number);
    return new Date(year, month - 1, day);
  }
  return null;
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

export const calculateWeekendsInRange = (start: Date, end: Date): Weekends => {
  const weekends: Weekends = [];
  const currentDate = new Date(start);

  while (currentDate <= end) {
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      weekends.push(formatDate(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return weekends;
};

export const generateCalendarGrid = (year: number, month: number): Date[][] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const grid: Date[][] = [];
  let week: Date[] = [];

  for (let i = startDay - 1; i >= 0; i--) {
    week.push(new Date(year, month, -i));
  }

  for (let i = 1; i <= daysInMonth; i++) {
    week.push(new Date(year, month, i));
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  }

  let nextDay = 1;
  while (week.length < 7) {
    week.push(new Date(year, month + 1, nextDay++));
  }
  grid.push(week);

  return grid;
};

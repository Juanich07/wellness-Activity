export type DailyProgressActivity = {
  id: string;
  title: string;
  time: string;
  type: string;
  duration: number;
  description?: string;
};

export type DailyProgressRecord = {
  id: string;
  userId: string;
  dateKey: string;
  ids: string[];
  activities: DailyProgressActivity[];
  startedIds: string[];
  completedIds: string[];
};

export const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getLastSevenDateKeys = (date = new Date()) =>
  Array.from({ length: 7 }, (_, index) => {
    const day = new Date(date);
    day.setDate(date.getDate() - (6 - index));
    return getLocalDateKey(day);
  });

export const getWeekDateKeys = (date = new Date()) => {
  const day = new Date(date);
  const mondayOffset = (day.getDay() + 6) % 7;
  day.setDate(day.getDate() - mondayOffset);
  return Array.from({ length: 7 }, () => {
    const key = getLocalDateKey(day);
    day.setDate(day.getDate() + 1);
    return key;
  });
};

export const asDailyProgressRecord = (id: string, data: Record<string, unknown>): DailyProgressRecord => ({
  id,
  userId: String(data.userId ?? ''),
  dateKey: String(data.dateKey ?? ''),
  ids: Array.isArray(data.ids) ? data.ids.map(String) : [],
  activities: Array.isArray(data.activities) ? data.activities as DailyProgressActivity[] : [],
  startedIds: Array.isArray(data.startedIds) ? data.startedIds.map(String) : [],
  completedIds: Array.isArray(data.completedIds) ? data.completedIds.map(String) : [],
});
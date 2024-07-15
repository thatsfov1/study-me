export type TimeValue = {
  hours: number;
  minutes: number;
  seconds: number;
};

export type TGoal = {
  id: string;
  title: string;
  time?: TimeValue;
  description?: string;
};

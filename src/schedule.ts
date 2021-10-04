import schedule from 'node-schedule';

import { time } from './times';

const scheduledCallbacks: string[] = [];

interface RecurringCallbackConfig {
  callback: () => void;
  hour?: number | number[] | null;
  minute?: number | number[] | null;
  name: string;
}

export const scheduleRecurringCallback = ({
  hour = null,
  minute = null,
  callback,
  name,
}: RecurringCallbackConfig) => {
  if (scheduledCallbacks.includes(name)) {
    console.log(`${name} is already scheduled, skipping scheduling`);
    return;
  }

  schedule.scheduleJob({ hour, minute }, callback);
  scheduledCallbacks.push(name);
  console.log(`Scheduled ${name}`);
};

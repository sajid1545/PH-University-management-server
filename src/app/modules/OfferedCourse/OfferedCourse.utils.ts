import { TSchedule } from './OfferedCourse.interface';

export const hasTimeConflict = (
    assignedSchedules: TSchedule[],
    newSchedule: TSchedule,
) => {
    for (const schedule of assignedSchedules) {
        const existingStartTime = new Date(`1970-01-01T${schedule.startTime}`);
        const existingEndTime = new Date(`1970-01-01T${schedule.endTime}`);
        const newStartTime = new Date(`1970-01-01T${newSchedule.startTime}`);
        const newEndTime = new Date(`1970-01-01T${newSchedule.endTime}`);

        // 10:30 (existingStartTime) -  12:30 (existingEndTime)
        // 11:30 (newStartTime)  - 1:30 (newEndTime)

        if (newStartTime < existingEndTime && newEndTime > existingStartTime) {
            console.log('yes');
            return true;
        }
    }

    return false;
};

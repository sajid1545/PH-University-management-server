import { z } from 'zod';
import { Days } from './OfferedCourse.constant';

const timeStringSchema = z.string().refine(
    (time) => {
        const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

        return regex.test(time);
    },
    { message: 'Invalid time format, expected: HH:MM' },
);

const createOfferedCourseSchemaValidation = z.object({
    body: z
        .object({
            semesterRegistration: z.string(),
            academicDepartment: z.string(),
            academicFaculty: z.string(),
            course: z.string(),
            faculty: z.string(),
            maxCapacity: z.number(),
            section: z.number(),
            days: z.array(z.enum([...Days] as [string, ...string[]])),
            startTime: timeStringSchema, // HH :: MM  // 00 - 23  || 00 - 59
            endTime: timeStringSchema, // HH :: MM  // 00 - 23  || 00 - 59,
        })
        .refine(
            (body) => {
                // startTime : 10:30 // 1970-01 - 01T10:30
                // endTime : 12:30 // 1970-01 - 01T12:30

                const start = new Date(`1970-01-01T${body.startTime}:00`);
                const end = new Date(`1970-01-01T${body.endTime}:00`);
                return end > start;
            },
            {
                message: 'End time must be greater than start time',
            },
        ),
});

const updateOfferedCourseSchemaValidation = z.object({
    body: z
        .object({
            faculty: z.string(),
            maxCapacity: z.number(),
            days: z.array(z.enum([...Days] as [string, ...string[]])),
            startTime: timeStringSchema,
            endTime: timeStringSchema,
        })
        .refine(
            (body) => {
                // startTime : 10:30 // 1970-01 - 01T10:30
                // endTime : 12:30 // 1970-01 - 01T12:30

                const start = new Date(`1970-01-01T${body.startTime}:00`);
                const end = new Date(`1970-01-01T${body.endTime}:00`);
                return end > start;
            },
            {
                message: 'End time must be greater than start time',
            },
        ),
});

export const OfferedCourseValidations = {
    createOfferedCourseSchemaValidation,
    updateOfferedCourseSchemaValidation,
};

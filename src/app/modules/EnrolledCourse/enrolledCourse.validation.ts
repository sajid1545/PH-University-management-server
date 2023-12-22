import { z } from 'zod';

const createEnrolledCourseValidationSchema = z.object({
    body: z.object({
        offeredCourse: z.string({
            required_error: 'Offered Course is required',
            invalid_type_error: 'Offered Course must be a string',
        }),
    }),
});

export const EnrolledCourseValidations = {
    createEnrolledCourseValidationSchema,
};

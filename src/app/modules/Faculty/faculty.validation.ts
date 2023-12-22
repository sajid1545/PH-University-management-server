import { z } from 'zod';
import { BloodGroup, Gender } from './faculty.constants';

const createUserNameValidationSchema = z.object({
    firstName: z
        .string()
        .min(1)
        .max(20)
        .refine((value) => /^[A-Z]/.test(value), {
            message: 'First Name must start with a capital letter',
        }),
    middleName: z.string(),
    lastName: z.string(),
});

export const createFacultyValidationSchema = z.object({
    body: z.object({
        password: z.string().max(20),
        faculty: z.object({
            name: createUserNameValidationSchema,
            gender: z.enum([...Gender] as [string, ...string[]]),
            designation: z.string({
                required_error: 'Designation is required',
                invalid_type_error: 'Designation must be a string',
            }),
            dateOfBirth: z.string().optional(),
            email: z.string().email(),
            contactNumber: z.string(),
            emergencyContactNo: z.string(),
            bloodGroup: z.enum([...BloodGroup] as [string, ...string[]]),
            presentAddress: z.string(),
            permanentAddress: z.string(),
            // profileImage: z.string(),
            academicDepartment: z.string(),
        }),
    }),
});

const updateUserNameValidationSchema = z.object({
    firstName: z.string().min(1).max(20).optional(),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
});

export const updateFacultyValidationSchema = z.object({
    body: z.object({
        faculty: z.object({
            name: updateUserNameValidationSchema,
            gender: z.enum([...Gender] as [string, ...string[]]).optional(),
            designation: z.string().optional(),
            dateOfBirth: z.string().optional(),
            email: z.string().email().optional(),
            contactNumber: z.string().optional(),
            emergencyContactNo: z.string().optional(),
            bloodGroup: z
                .enum([...BloodGroup] as [string, ...string[]])
                .optional(),
            presentAddress: z.string().optional(),
            permanentAddress: z.string().optional(),
            profileImage: z.string().optional(),
            academicDepartment: z.string().optional(),
        }),
    }),
});

export const FacultyValidations = {
    createFacultyValidationSchema,
    updateFacultyValidationSchema,
};

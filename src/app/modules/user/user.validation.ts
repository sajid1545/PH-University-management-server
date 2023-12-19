import { z } from 'zod';
import { UserStatus } from './user.constant';

const userSchema = z.object({
    password: z
        .string({
            invalid_type_error: 'Password must be a string',
        })
        .max(20, { message: 'Password should not exceed 20 characters' })
        .optional(),
});

const changeStatusValidationSchema = z.object({
    body: z.object({
        status: z.enum([...UserStatus] as [string, ...string[]]),
    }),
});

export const UserValidation = {
    userSchema,
    changeStatusValidationSchema,
};

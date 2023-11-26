import { z } from 'zod';

const userSchema = z.object({
    password: z
        .string({
            invalid_type_error: 'Password must be a string',
        })
        .max(20, { message: 'Password should not exceed 20 characters' })
        .optional(),
});

export const UserValidation = {
    userSchema,
};

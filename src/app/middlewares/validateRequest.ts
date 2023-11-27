import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

const validateRequest = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // validation
        try {
            await schema.parseAsync({
                body: req.body,
            });
        } catch (error) {
            next(error);
        }
        return next();
    };
};

export default validateRequest;

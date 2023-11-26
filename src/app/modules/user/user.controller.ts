/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { UserServices } from './user.services';

const createStudent = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { password, student: studentData } = req.body;

        // const zodParsedData = studentValidationSchema.parse(studentData);

        const result = await UserServices.createStudentIntoDB(
            password,
            studentData,
        );

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: result,
        });
    } catch (err: any) {
        next(err);
    }
};

export const UserControllers = {
    createStudent,
};

import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { StudentServices } from './student.services';

const getAllStudents = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const students = await StudentServices.getAllStudentsFromDB();

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Student fetched successfully',
            data: students,
        });
    } catch (error) {
        next(error);
    }
};

const getSingleStudent = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const studentID = req.params.studentID;
        const student = await StudentServices.getSingleStudentFromDB(studentID);

        res.status(200).json({
            success: true,
            message: 'Student fetched successfully',
            data: student,
        });
    } catch (error) {
        next(error);
    }
};

const deleteStudent = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { studentID } = req.params;
        const result = await StudentServices.deleteStudentFromDB(studentID);

        res.status(200).json({
            success: true,
            message: 'Student deleted successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const StudentControllers = {
    getAllStudents,
    getSingleStudent,
    deleteStudent,
};

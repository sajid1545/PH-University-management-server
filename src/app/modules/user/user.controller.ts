/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.services';

const createStudent = catchAsync(async (req, res) => {
    const { password, student: studentData } = req.body;

    const result = await UserServices.createStudentIntoDB(
        password,
        studentData,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Student created successfully',
        data: result,
    });
});

const createFaculty = catchAsync(async (req, res) => {
    const { password, faculty } = req.body;

    const result = await UserServices.createFacultyIntoDB(password, faculty);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Faculty created successfully',
        data: result,
    });
});

const createAdmin = catchAsync(async (req, res) => {
    const { password, admin } = req.body;

    const result = await UserServices.createAdminIntoDB(password, admin);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Admin created successfully',
        data: result,
    });
});

export const UserControllers = {
    createStudent,
    createFaculty,
    createAdmin,
};

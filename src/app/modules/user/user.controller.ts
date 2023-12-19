/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.services';

const createStudent = catchAsync(async (req, res) => {
    // console.log(req.file, 'file');
    // console.log(req.body);
    const { password, student: studentData } = req.body;

    const result = await UserServices.createStudentIntoDB(
        password,
        studentData,
        req.file,
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
const getMe = catchAsync(async (req, res) => {
    const { userId, role } = req.user;

    const result = await UserServices.getMe(userId, role);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Data fetched successfully',
        data: result,
    });
});
const changeStatus = catchAsync(async (req, res) => {
    const id = req.params.id;

    const result = await UserServices.changeStatus(id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Status changed successfully',
        data: result,
    });
});

export const UserControllers = {
    createStudent,
    createFaculty,
    createAdmin,
    getMe,
    changeStatus,
};

import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { OfferedCourseServices } from './OfferedCourse.service';

const createOfferedCourse = catchAsync(async (req, res) => {
    const result = await OfferedCourseServices.createOfferedCourseIntoDB(
        req.body,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Offered Course created successfully',
        data: result,
    });
});

const getAllOfferedCourses = catchAsync(async (req, res) => {
    const result = await OfferedCourseServices.getAllOfferedCoursesFromDB(
        req.query,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Offered Courses fetched successfully',
        meta: result.meta,
        data: result.result,
    });
});

const getMyOfferedCourses = catchAsync(async (req, res) => {
    const userId = req.user.userId;
    const result = await OfferedCourseServices.getMyOfferedCoursesFromDB(
        userId,
        req.query,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Your Offered Courses fetched successfully',
        meta: result.meta,
        data: result.result,
    });
});

const getSingleOfferedCourse = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await OfferedCourseServices.getSingleOfferedCourseFromDB(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Offered Course fetched successfully',
        data: result,
    });
});

const updateOfferedCourse = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await OfferedCourseServices.updateOfferedCourseIntoDB(
        id,
        req.body,
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Offered Course updated successfully',
        data: result,
    });
});

const deleteOfferedCourse = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await OfferedCourseServices.deleteOfferedCourseFromDB(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Offered Course deleted successfully',
        data: result,
    });
});

export const OfferedCourseController = {
    createOfferedCourse,
    updateOfferedCourse,
    deleteOfferedCourse,
    getAllOfferedCourses,
    getSingleOfferedCourse,
    getMyOfferedCourses,
};

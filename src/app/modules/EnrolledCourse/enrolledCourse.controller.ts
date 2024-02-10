import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { EnrolledCourseServices } from './enrolledCourse.service';

const createEnrolledCourse = catchAsync(async (req, res) => {
    const userId = req.user.userId;
    const result = await EnrolledCourseServices.createEnrolledCourseIntoDB(
        userId,
        req.body,
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Student enrolled successfully',
        data: result,
    });
});

const getMyEnrolledCourses = catchAsync(async (req, res) => {
    const studentId = req.user.userId;

    const result = await EnrolledCourseServices.getMyEnrolledCoursesFromDB(
        studentId,
        req.query,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Enrolled courses are retrivied succesfully',
        meta: result.meta,
        data: result.result,
    });
});

const getFacultyEnrolledCourses = catchAsync(async (req, res) => {
    console.log(req.user);
    const facultyId = req.user.userId;

    const result = await EnrolledCourseServices.getFacultyEnrolledCoursesFromDB(
        facultyId,
        req.query,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Enrolled courses are retrivied succesfully for faculty',
        meta: result.meta,
        data: result.result,
    });
});

const updateEnrolledCourseMarks = catchAsync(async (req, res) => {
    const facultyId = req.user.userId;

    const result = await EnrolledCourseServices.updateEnrolledCourseMarksIntoDB(
        facultyId,
        req.body,
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Student marks updated successfully',
        data: result,
    });
});

export const EnrolledCourseControllers = {
    createEnrolledCourse,
    updateEnrolledCourseMarks,
    getMyEnrolledCourses,
    getFacultyEnrolledCourses,
};

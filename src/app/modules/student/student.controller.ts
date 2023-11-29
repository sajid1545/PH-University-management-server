/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StudentServices } from './student.services';

const getAllStudents = catchAsync(async (req, res) => {
    const students = await StudentServices.getAllStudentsFromDB();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Student fetched successfully',
        data: students,
    });
});

const getSingleStudent = catchAsync(async (req, res) => {
    const studentID = req.params.studentID;
    const student = await StudentServices.getSingleStudentFromDB(studentID);

    res.status(200).json({
        success: true,
        message: 'Student fetched successfully',
        data: student,
    });
});

const updateStudent = catchAsync(async (req, res) => {
    const { studentID } = req.params;
    const { student } = req.body;
    const result = await StudentServices.updateStudentIntoDB(
        studentID,
        student,
    );

    res.status(200).json({
        success: true,
        message: 'Student updated successfully',
        data: result,
    });
});

const deleteStudent = catchAsync(async (req, res) => {
    const { studentID } = req.params;
    const result = await StudentServices.deleteStudentFromDB(studentID);

    res.status(200).json({
        success: true,
        message: 'Student deleted successfully',
        data: result,
    });
});

export const StudentControllers = {
    getAllStudents,
    getSingleStudent,
    deleteStudent,
    updateStudent,
};

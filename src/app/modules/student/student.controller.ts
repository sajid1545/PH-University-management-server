/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StudentServices } from './student.services';

const getAllStudents = catchAsync(async (req, res) => {
    const result = await StudentServices.getAllStudentsFromDB(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Student fetched successfully',
        meta: result.meta,
        data: result.result,
    });
});

const getSingleStudent = catchAsync(async (req, res) => {
    const id = req.params.id;
    const student = await StudentServices.getSingleStudentFromDB(id);

    res.status(200).json({
        success: true,
        message: 'Student fetched successfully',
        data: student,
    });
});

const updateStudent = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { student } = req.body;
    const result = await StudentServices.updateStudentIntoDB(id, student);

    res.status(200).json({
        success: true,
        message: 'Student updated successfully',
        data: result,
    });
});

const deleteStudent = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await StudentServices.deleteStudentFromDB(id);

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

import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AcademicFacultyServices } from './academicFaculty.services';

const createAcademicFaculty = catchAsync(async (req, res) => {
    const result = await AcademicFacultyServices.createAcademicFacultyIntoDB(
        req.body,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Academic faculty created successfully',
        data: result,
    });
});

const getAllAcademicFaculties = catchAsync(async (req, res) => {
    const result = await AcademicFacultyServices.getAllAcademicFacultiesFromDB(
        req.query,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Academic faculties are retrieved successfully',
        meta: result.meta,
        data: result.result,
    });
});

const getSingleAcademicFaculty = catchAsync(async (req, res) => {
    const { facultyId } = req.params;
    const result =
        await AcademicFacultyServices.getSingleAcademicFacultyFromDB(facultyId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Academic faculty fetched successfully',
        data: result,
    });
});

const updateAcademicFaculty = catchAsync(async (req, res) => {
    const { facultyId } = req.params;

    const result = await AcademicFacultyServices.updateAcademicFacultyIntoDB(
        facultyId,
        req.body,
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Academic faculty updated successfully',
        data: result,
    });
});

export const AcademicFacultyControllers = {
    createAcademicFaculty,
    getAllAcademicFaculties,
    getSingleAcademicFaculty,
    updateAcademicFaculty,
};

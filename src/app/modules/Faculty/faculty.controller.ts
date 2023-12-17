import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FacultyServices } from './faculty.services';

const getAllFaculties = catchAsync(async (req, res) => {
    const result = await FacultyServices.getAllFacultiesFromDB(req.query);

    console.log(req.cookies);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Faculties fetched successfully',
        data: result,
    });
});

const getSingleFaculty = catchAsync(async (req, res) => {
    const { facultyId } = req.params;

    const result = await FacultyServices.getSingleFacultyFromDB(facultyId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Faculty fetched successfully',
        data: result,
    });
});

const updateFaculty = catchAsync(async (req, res) => {
    const { facultyId } = req.params;
    const { faculty } = req.body;

    const result = await FacultyServices.updateFacultyIntoDB(
        facultyId,
        faculty,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Faculty updated successfully',
        data: result,
    });
});

const deleteFaculty = catchAsync(async (req, res) => {
    const { facultyId } = req.params;
    const result = await FacultyServices.deleteFacultyFromDB(facultyId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Faculty deleted successfully',
        data: result,
    });
});

export const FacultyControllers = {
    getAllFaculties,
    getSingleFaculty,
    updateFaculty,
    deleteFaculty,
};

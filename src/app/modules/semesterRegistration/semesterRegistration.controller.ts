import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SemesterRegistrationServices } from './semesterRegistration.service';

const createSemesterRegistration = catchAsync(
    async (req: Request, res: Response) => {
        const result =
            await SemesterRegistrationServices.createSemesterRegistrationIntoDB(
                req.body,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Semester registration created successfully',
            data: result,
        });
    },
);

const getSingleSemesterRegistration = catchAsync(
    async (req: Request, res: Response) => {
        const result =
            await SemesterRegistrationServices.getSingleSemesterRegistrationFromDB(
                req.params.id,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Semester registration fetched successfully',
            data: result,
        });
    },
);
const getAllSemesterRegistrations = catchAsync(
    async (req: Request, res: Response) => {
        const result =
            await SemesterRegistrationServices.getAllSemesterRegistrationsFromDB(
                req.query,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Semester registrations retrieved successfully',
            data: result,
        });
    },
);
const updateSemesterRegistration = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const result =
            await SemesterRegistrationServices.updateSemesterRegistrationIntoDB(
                id,
                req.body,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Semester registration updated successfully',
            data: result,
        });
    },
);

const deleteSemesterRegistrationAndOfferedCoursesFromDB = catchAsync(
    async (req, res) => {
        const result =
            await SemesterRegistrationServices.deleteSemesterRegistrationAndOfferedCoursesFromDB(
                req.params.id,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Semester registration deleted successfully',
            data: result,
        });
    },
);

export const SemesterRegistrationControllers = {
    createSemesterRegistration,
    getAllSemesterRegistrations,
    getSingleSemesterRegistration,
    updateSemesterRegistration,
    deleteSemesterRegistrationAndOfferedCoursesFromDB,
};

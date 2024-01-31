/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AcademicSemesterServices } from './academicSemester.services';

const createAcademicSemester = catchAsync(async (req, res) => {
    const result = await AcademicSemesterServices.createAcademicSemesterIntoDB(
        req.body,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Academic semester created successfully',
        data: result,
    });
});

const getAllAcademicSemesters = catchAsync(
    async (req: Request, res: Response) => {
        const result =
            await AcademicSemesterServices.getAllAcademicSemestersFromDB(
                req.query,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Academic semesters are retrieved successfully',
            meta: result.meta,
            data: result.result,
        });
    },
);

const getSingleAcademicSemester = catchAsync(
    async (req: Request, res: Response) => {
        const id = req.params.semesterId;
        const result =
            await AcademicSemesterServices.getSingleAcademicSemesterFromDb(id);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Academic semester fetched successfully',
            data: result,
        });
    },
);

const updateAcademicSemester = catchAsync(
    async (req: Request, res: Response) => {
        const id = req.params.semesterId;
        const payload = req.body;
        const result =
            await AcademicSemesterServices.updateAcademicSemesterIntoDB(
                id,
                payload,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Academic semester updated successfully',
            data: result,
        });
    },
);

export const AcademicSemesterControllers = {
    createAcademicSemester,
    getAllAcademicSemesters,
    getSingleAcademicSemester,
    updateAcademicSemester,
};

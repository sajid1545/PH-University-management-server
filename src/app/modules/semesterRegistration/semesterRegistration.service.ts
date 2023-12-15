import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { OfferedCourse } from '../OfferedCourse/OfferedCourse.model';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { RegistrationStatus } from './semesterRegistration.constant';
import { TSemesterRegistration } from './semesterRegistration.interface';
import { SemesterRegistration } from './semesterRegistration.model';

// ai muhurte jodi amader register kora kono semister ONGOING ba UPCOMING obosthai thake tahole amra admin k notun arekti semester registration korte dibo na

const createSemesterRegistrationIntoDB = async (
    payload: TSemesterRegistration,
) => {
    const academicSemester = payload?.academicSemester;

    // check if there is registered semester that is already UPCOMING or ONGOING
    const isThereAnyUpcomingOrOngoingSemester =
        await SemesterRegistration.findOne({
            $or: [
                { status: RegistrationStatus.UPCOMING },
                { status: RegistrationStatus.ONGOING },
            ],
        });
    if (isThereAnyUpcomingOrOngoingSemester) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `There is already a semester with ${isThereAnyUpcomingOrOngoingSemester.status} status! `,
        );
    }

    // CHECK IF Academic Semester EXISTS
    const isAcademicSemesterExists =
        await AcademicSemester.findById(academicSemester);
    if (!isAcademicSemesterExists) {
        throw new AppError(httpStatus.NOT_FOUND, 'Academic semester not found');
    }

    // check if academic semester is already registered
    const isSemesterRegistrationExists = await SemesterRegistration.findOne({
        academicSemester,
    });
    if (isSemesterRegistrationExists) {
        throw new AppError(
            httpStatus.CONFLICT,
            'Semester registration already exists',
        );
    }

    const result = await SemesterRegistration.create(payload);
    return result;
};
const getAllSemesterRegistrationsFromDB = async (
    query: Record<string, unknown>,
) => {
    const semesterRegistrationQuery = new QueryBuilder(
        SemesterRegistration.find().populate('academicSemester'),
        query,
    )

        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await semesterRegistrationQuery.modelQuery;
    return result;
};
const getSingleSemesterRegistrationFromDB = async (id: string) => {
    const result = await SemesterRegistration.findById(id);
    return result;
};
const updateSemesterRegistrationIntoDB = async (
    id: string,
    payload: Partial<TSemesterRegistration>,
) => {
    // check if requested register semester exists
    const isSemesterRegistrationExists =
        await SemesterRegistration.findById(id);
    if (!isSemesterRegistrationExists) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Semester registration not found',
        );
    }

    // IF the requested semester registration is ENDED, we will not update anything

    const currentSemesterStatus = isSemesterRegistrationExists?.status;
    const requestedStatus = payload?.status;

    if (currentSemesterStatus === RegistrationStatus.ENDED) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `This semester has already ${currentSemesterStatus}`,
        );
    }

    // UPCOMING --> ONGOING --> ENDED
    if (
        currentSemesterStatus === RegistrationStatus.UPCOMING &&
        requestedStatus === RegistrationStatus.ENDED
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `you can't directly change the status from  ${currentSemesterStatus} to ${requestedStatus}`,
        );
    }

    if (
        currentSemesterStatus === RegistrationStatus.ONGOING &&
        requestedStatus === RegistrationStatus.UPCOMING
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `you can't directly change the status from  ${currentSemesterStatus} to ${requestedStatus}`,
        );
    }

    const result = await SemesterRegistration.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
};

const deleteSemesterRegistrationAndOfferedCoursesFromDB = async (
    id: string,
) => {
    // check if registerSemester exists or not
    const isRegisteredSemesterExists = await SemesterRegistration.findById(id);

    if (!isRegisteredSemesterExists) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Semester registration not found',
        );
    }

    const currentStatus = isRegisteredSemesterExists?.status;

    if (currentStatus !== RegistrationStatus.UPCOMING) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `You can not delete the semester registration with ${currentStatus} status`,
        );
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // delete offered courses associated with same registered semester

        const registerSemesterAssociatedOfferedCourses =
            await OfferedCourse.find({
                semesterRegistration: id,
            });

        if (registerSemesterAssociatedOfferedCourses.length > 0) {
            const deleteCourses = await OfferedCourse.deleteMany({
                semesterRegistration: id,
            });

            if (!deleteCourses) {
                throw new AppError(httpStatus.NOT_FOUND, 'Course not found');
            }
        }

        // delete register semester

        const deleteRegisteredSemester =
            await SemesterRegistration.findByIdAndDelete(id);

        if (!deleteRegisteredSemester) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Semester registration delete failed',
            );
        }

        await session.commitTransaction();
        await session.endSession();
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        throw error;
    }
};

export const SemesterRegistrationServices = {
    createSemesterRegistrationIntoDB,
    getAllSemesterRegistrationsFromDB,
    getSingleSemesterRegistrationFromDB,
    updateSemesterRegistrationIntoDB,
    deleteSemesterRegistrationAndOfferedCoursesFromDB,
};

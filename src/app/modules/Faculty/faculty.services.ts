import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { facultySearchableFields } from './faculty.constants';
import { TFaculty } from './faculty.interface';
import { Faculty } from './faculty.model';

const getAllFacultiesFromDB = async (query: Record<string, unknown>) => {
    const faculties = new QueryBuilder(Faculty.find(), query)
        .search(facultySearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = await faculties.modelQuery;
    return result;
};

const getSingleFacultyFromDB = async (id: string) => {
    const result = await Faculty.findById(id);
    return result;
};

const updateFacultyIntoDB = async (id: string, payload: Partial<TFaculty>) => {
    const { name, ...remainingFacultyData } = payload;

    const modifiedFacultyData: Record<string, unknown> = {
        ...remainingFacultyData,
    };

    if (name && Object.keys(name).length) {
        for (const [key, value] of Object.entries(name)) {
            modifiedFacultyData[`name.${key}`] = value;
        }
    }

    const result = await Faculty.findOneAndUpdate({ id }, modifiedFacultyData, {
        new: true,
    });
    return result;
};

const deleteFacultyFromDB = async (id: string) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const deletedUser = await User.findOneAndUpdate(
            { id },
            { isDeleted: true },
            { new: true, session },
        );

        if (!deletedUser) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete user');
        }

        const deleteFaculty = await Faculty.findOneAndUpdate(
            { id },
            { isDeleted: true },
            { new: true, session }, // { new : true } returns the updated document
        );

        if (!deleteFaculty) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete user');
        }

        await session.commitTransaction();
        await session.endSession();
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Failed to delete student');
    }
};

export const FacultyServices = {
    getAllFacultiesFromDB,
    getSingleFacultyFromDB,
    updateFacultyIntoDB,
    deleteFacultyFromDB,
};

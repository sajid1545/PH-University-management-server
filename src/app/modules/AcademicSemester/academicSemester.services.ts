import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import {
    AcademicSemesterSearchableFields,
    academicSemesterNameCodeMapper,
} from './academicSemester.constants';
import { TAcademicSemester } from './academicSemester.interface';
import { AcademicSemester } from './academicSemester.model';

const createAcademicSemesterIntoDB = async (payload: TAcademicSemester) => {
    // semester name --> semester code

    // {
    //     "name": "Fall",
    //     "code": "01",
    //     "year": "2030",
    //     "startMonth": "January",
    //     "endMonth": "April"
    // }

    // academicSemesterNameCodeMapper['Fall'] --> 03 hocche output
    if (academicSemesterNameCodeMapper[payload.name] !== payload.code) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Invalid Academic semester code',
        );
    }
    const result = await AcademicSemester.create(payload);
    return result;
};

const getAllAcademicSemestersFromDB = async (
    query: Record<string, unknown>,
) => {
    const academicSemesterQuery = new QueryBuilder(
        AcademicSemester.find(),
        query,
    )
        .search(AcademicSemesterSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await academicSemesterQuery.modelQuery;
    const meta = await academicSemesterQuery.countTotal();

    return {
        meta,
        result,
    };
};

const getSingleAcademicSemesterFromDb = async (id: string) => {
    const result = await AcademicSemester.findById(id);
    return result;
};

const updateAcademicSemesterIntoDB = async (
    id: string,
    payload: Partial<TAcademicSemester>,
) => {
    if (
        payload.name &&
        payload.code &&
        academicSemesterNameCodeMapper[payload.name] !== payload.code
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Invalid Academic semester code',
        );
    }

    const result = await AcademicSemester.findOneAndUpdate(
        { _id: id },
        payload,
        {
            new: true,
        },
    );
    return result;
};

export const AcademicSemesterServices = {
    createAcademicSemesterIntoDB,
    getAllAcademicSemestersFromDB,
    getSingleAcademicSemesterFromDb,
    updateAcademicSemesterIntoDB,
};

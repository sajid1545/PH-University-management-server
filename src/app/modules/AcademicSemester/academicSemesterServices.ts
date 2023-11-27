import { TAcademicSemester } from './academicSemester.interface';
import { AcademicSemester } from './academicSemester.model';
import { academicSemesterNameCodeMapper } from './academicSemesterConstants';

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
        throw new Error('Invalid Academic semester code');
    }
    const result = await AcademicSemester.create(payload);
    return result;
};

const getAllAcademicSemestersFromDB = async () => {
    const result = await AcademicSemester.find();
    return result;
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
        throw new Error('Invalid Academic semester code');
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

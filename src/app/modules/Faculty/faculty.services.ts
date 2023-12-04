import QueryBuilder from '../../builder/QueryBuilder';
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
    const result = await Faculty.findOne({ id });
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

export const FacultyServices = {
    getAllFacultiesFromDB,
    getSingleFacultyFromDB,
    updateFacultyIntoDB,
};

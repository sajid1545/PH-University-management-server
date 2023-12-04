import QueryBuilder from '../../builder/QueryBuilder';
import { facultySearchableFields } from './faculty.constants';
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

export const FacultyServices = {
    getAllFacultiesFromDB,
};

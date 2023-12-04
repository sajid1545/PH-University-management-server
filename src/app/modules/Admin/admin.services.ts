import QueryBuilder from '../../builder/QueryBuilder';
import { adminSearchableFields } from './admin.constants';
import { Admin } from './admin.model';

const getAllAdminsFromDB = async (query: Record<string, unknown>) => {
    const admin = new QueryBuilder(Admin.find(), query)
        .search(adminSearchableFields)
        .filter()
        .fields()
        .sort()
        .paginate();

    const result = await admin.modelQuery;
    return result;
};

export const AdminServices = {
    getAllAdminsFromDB,
};

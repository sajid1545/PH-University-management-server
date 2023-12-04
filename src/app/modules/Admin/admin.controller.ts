import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AdminServices } from './admin.services';

const getAllAdmins = catchAsync(async (req, res) => {
    const result = await AdminServices.getAllAdminsFromDB(req.query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Admins fetched successfully',
        data: result,
    });
});

export const AdminControllers = {
    getAllAdmins,
};

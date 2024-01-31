import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AdminServices } from './admin.services';

const getAllAdmins = catchAsync(async (req, res) => {
    const result = await AdminServices.getAllAdminsFromDB(req.query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Admins fetched successfully',
        meta: result.meta,
        data: result.result,
    });
});

const getSingleAdmin = catchAsync(async (req, res) => {
    const { adminId } = req.params;
    const result = await AdminServices.getSingleAdminFromDB(adminId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Admin fetched successfully',
        data: result,
    });
});

const updateAdmin = catchAsync(async (req, res) => {
    const { adminId } = req.params;
    const { admin } = req.body;
    const result = await AdminServices.updateAdminIntoDB(adminId, admin);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Admin updated successfully',
        data: result,
    });
});

const deleteAdmin = catchAsync(async (req, res) => {
    const { adminId } = req.params;
    const result = await AdminServices.deleteAdminFromDB(adminId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Admin deleted successfully',
        data: result,
    });
});

export const AdminControllers = {
    getAllAdmins,
    getSingleAdmin,
    updateAdmin,
    deleteAdmin,
};

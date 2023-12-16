import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { TLoginUser } from './auth.interface';

const loginUser = async (payload: TLoginUser) => {
    // checking if the user exists
    const user = await User.isUserExistsByCustom(payload?.id);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // checking if the user is deleted
    if (await User.isUserDeleted(payload?.id)) {
        throw new AppError(httpStatus.FORBIDDEN, 'User is already deleted');
    }

    // checking if the user is blocked
    if (await User.isUserBlocked(payload?.id)) {
        throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
    }

    // checking if the password is correct or not
    if (!(await User.isPasswordMatched(payload?.password, user?.password))) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Password does not match');
    }

    // Access granted: Send access token, refresh token

    // create token and sent to client

    const jwtPayload = {
        userId: user?.id,
        role: user?.role,
    };

    const accessToken = jwt.sign(
        jwtPayload,
        config.jwt_access_secret as string,
        {
            expiresIn: '10d',
        },
    );

    return {
        accessToken,
        needsPasswordChange: user?.needsPasswordChange,
    };
};

const changePassword = async (
    userData: JwtPayload,
    payload: {
        oldPassword: string;
        newPassword: string;
    },
) => {
    // checking if the user exists
    const user = await User.isUserExistsByCustom(userData?.userId);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // checking if the user is deleted
    if (await User.isUserDeleted(userData?.userId)) {
        throw new AppError(httpStatus.FORBIDDEN, 'User is already deleted');
    }

    // checking if the user is blocked
    if (await User.isUserBlocked(userData?.userId)) {
        throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
    }

    // checking if the password is correct or not
    if (!(await User.isPasswordMatched(payload?.oldPassword, user.password))) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Password does not match');
    }

    // hashing the new password
    const newHashedPassword = await bcrypt.hash(
        payload?.newPassword,
        Number(config.bcrypt_salt_rounds),
    );

    await User.findOneAndUpdate(
        {
            id: userData?.userId,
            role: userData?.role,
        },
        {
            password: newHashedPassword,
            needsPasswordChange: false,
            passwordChangedAt: new Date(),
        },
    );
    return null;
};

export const AuthServices = {
    loginUser,
    changePassword,
};

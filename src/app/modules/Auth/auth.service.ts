import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../errors/AppError';
import { sendEmail } from '../../utils/sendEmail';
import { User } from '../user/user.model';
import { TLoginUser } from './auth.interface';
import { createToken } from './auth.utils';

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

    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.jwt_access_expires_in as string,
    );

    const refreshToken = createToken(
        jwtPayload,
        config.jwt_refresh_secret as string,
        config.jwt_refresh_expires_in as string,
    );

    return {
        accessToken,
        refreshToken,
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

const refreshToken = async (token: string) => {
    // check if the given token is valid

    const decoded = jwt.verify(
        token,
        config.jwt_refresh_secret as string,
    ) as JwtPayload;

    const { userId, iat } = decoded;

    // checking if the user exists
    const user = await User.isUserExistsByCustom(userId);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // checking if the user is deleted
    if (await User.isUserDeleted(userId)) {
        throw new AppError(httpStatus.FORBIDDEN, 'User is already deleted');
    }

    // checking if the user is blocked
    if (await User.isUserBlocked(userId)) {
        throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
    }

    // checking if issued time

    if (
        user.passwordChangedAt &&
        (await User.isJWTIssuedBeforePasswordChanged(
            user.passwordChangedAt,
            iat as number,
        ))
    ) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    const jwtPayload = {
        userId: user?.id,
        role: user?.role,
    };

    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.jwt_access_expires_in as string,
    );

    return {
        accessToken,
    };
};

const forgetPassword = async (userId: string) => {
    // checking if the user exists
    const user = await User.isUserExistsByCustom(userId);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // checking if the user is deleted
    if (await User.isUserDeleted(userId)) {
        throw new AppError(httpStatus.FORBIDDEN, 'User is already deleted');
    }

    // checking if the user is blocked
    if (await User.isUserBlocked(userId)) {
        throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
    }

    const jwtPayload = {
        userId: user?.id,
        role: user?.role,
    };

    const resetToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        '10m',
    );

    const resetUILink = `${config.reset_password_ui_link}?id=${user.id}&token=${resetToken}`;

    sendEmail(user?.email, resetUILink);

    console.log(resetUILink);
};

const resetPassword = async (
    payload: { id: string; newPassword: string },
    token: string,
) => {
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

    // token verification

    const decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
    ) as JwtPayload;

    if (payload?.id !== decoded.userId) {
        throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized!');
    }

    // hashing the new password
    const newHashedPassword = await bcrypt.hash(
        payload?.newPassword,
        Number(config.bcrypt_salt_rounds),
    );

    await User.findOneAndUpdate(
        {
            id: decoded.userId,
            role: decoded?.role,
        },
        {
            password: newHashedPassword,
            needsPasswordChange: false,
            passwordChangedAt: new Date(),
        },
    );
};

export const AuthServices = {
    loginUser,
    changePassword,
    refreshToken,
    forgetPassword,
    resetPassword,
};

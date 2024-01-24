/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';
import { TUserRole } from '../modules/user/user.interface';
import { User } from '../modules/user/user.model';
import catchAsync from '../utils/catchAsync';

// const auth = (...requiredRoles: Array<keyof typeof USER_ROLE>) => //^ output ("admin" | "student" | "faculty")[]

// const auth = (...requiredRoles: TUserRole[]) => //^ output  ("admin" | "student" | "faculty")[]

const auth = (...requiredRoles: TUserRole[]) => {
    return catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const token = req.headers.authorization;

            // if token is sent from client or not
            if (!token) {
                throw new AppError(
                    httpStatus.UNAUTHORIZED,
                    'You are not authorized',
                );
            }

            // check if the given token is valid

            let decoded;
            try {
                decoded = jwt.verify(
                    token,
                    config.jwt_access_secret as string,
                ) as JwtPayload;
            } catch (error) {
                throw new AppError(
                    httpStatus.UNAUTHORIZED,
                    'You are not authorized',
                );
            }

            const { role, userId, iat } = decoded;

            // checking if the user exists
            const user = await User.isUserExistsByCustom(userId);

            if (!user) {
                throw new AppError(httpStatus.NOT_FOUND, 'User not found');
            }

            // checking if the user is deleted
            if (await User.isUserDeleted(userId)) {
                throw new AppError(
                    httpStatus.FORBIDDEN,
                    'User is already deleted',
                );
            }

            // checking if the user is blocked
            if (await User.isUserBlocked(userId)) {
                throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
            }

            // checking if issued time

            if (
                user.passwordChangedAt &&
                User.isJWTIssuedBeforePasswordChanged(
                    user.passwordChangedAt,
                    iat as number,
                )
            ) {
                throw new AppError(
                    httpStatus.UNAUTHORIZED,
                    'You are not authorized!',
                );
            }

            if (requiredRoles && !requiredRoles.includes(role)) {
                throw new AppError(
                    httpStatus.UNAUTHORIZED,
                    'You are not authorized',
                );
            }
            // decoded =   { userId: 'A-0001', role: 'admin', iat: 1702741157, exp: 1703605157 }
            req.user = decoded;
            next();
        },
    );
};

export default auth;

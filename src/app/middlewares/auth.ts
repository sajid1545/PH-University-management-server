import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';
import { TUserRole } from '../modules/user/user.interface';
import catchAsync from '../utils/catchAsync';

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

            // check if the token is valid

            jwt.verify(
                token,
                config.jwt_access_secret as string,
                function (err, decoded) {
                    // err
                    if (err) {
                        throw new AppError(
                            httpStatus.UNAUTHORIZED,
                            'You are not authorized',
                        );
                    }

                    const role = (decoded as JwtPayload)?.role;

                    if (requiredRoles && !requiredRoles.includes(role)) {
                        throw new AppError(
                            httpStatus.UNAUTHORIZED,
                            'You are not authorized',
                        );
                    }
                    // decoded =   { userId: 'A-0001', role: 'admin', iat: 1702741157, exp: 1703605157 }
                    req.user = decoded as JwtPayload;
                    next();
                },
            );
        },
    );
};

export default auth;

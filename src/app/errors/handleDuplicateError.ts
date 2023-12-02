/* eslint-disable @typescript-eslint/no-explicit-any */
import { TGenericErrorResponse } from '../interface/error';

const handleDuplicateError = (err: any): TGenericErrorResponse => {
    // Extracting the value within double quotes
    const match = err.message.match(/"([^"]*)"/);

    // Checking if a match is found
    const extractedMessage = match && match[1];

    const errorSources = [
        {
            path: '',
            message: `${extractedMessage} already exists`,
        },
    ];

    const statusCode = 400;
    return {
        statusCode,
        message: 'Invalid ID',
        errorSources,
    };
};

export default handleDuplicateError;

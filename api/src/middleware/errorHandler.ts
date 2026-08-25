import type { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message    = err instanceof AppError ? err.message   : 'Something went wrong';

    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
        return res.status(statusCode).json({ error: err.message, stack: err.stack });
    }
    return res.status(statusCode).json({ error: message });
};
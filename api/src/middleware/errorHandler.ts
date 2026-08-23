import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
        return res.status(500).json({ error: err.message, stack: err.stack });
    }
    return res.status(500).json({ error: 'Something went wrong!' });
};
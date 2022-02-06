import { Request, Response, NextFunction } from "express";

export const checkAuthHeaders = (req: Request, res: Response, next: NextFunction) => {
    if ('authorization' in req.headers)
        return next();

    return res.status(400).json({ message: "Token is missing!" });
}
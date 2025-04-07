import {Request, Response, NextFunction} from 'express';
import { Token, JwtPayload } from '../services/Jwt';

const token = new Token();

interface TokenPayload  extends JwtPayload {
    userId: string
};

export const tokenAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const accessToken = req.session.accessToken;
        if(accessToken) {
            const decoded = token.verifyAccessToken(accessToken);
            if(typeof decoded === "object" && "userId" in decoded) {
                req.user = decoded as TokenPayload;
                return next();
            } else {
                res.status(403).json({message: "Invalid token payload"});
                return;
            };
        }; 

        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) {
            res.status(401).json({message: "Unauthorized, please login"});
            return;
        };

        const decoded = token.verifyRefreshToken(refreshToken);

        if (decoded && typeof decoded === "object" && "userId" in decoded) {
            const { userId } = decoded;
            const { accessToken: newAccessToken } = token.generateTokens(userId);
            
            req.session.accessToken = newAccessToken;
            req.user =  decoded as TokenPayload;
            
            return next(); 
         } else {
            res.status(403).json({ message: "Invalid refresh token payload" });
            return;
         }

    } catch (error) {
        res.status(403).json({ message: "Invalid or expired token, please login again" });
        return;  
    };
};
import jwt, {JwtPayload} from 'jsonwebtoken';
import { IToken } from './interfaces/IToken';
import dotenv from 'dotenv';
dotenv.config();
export { JwtPayload };

export class Token implements IToken {
    private readonly jwt_key: string = process.env.JWT_SECRET || " ";
    private readonly refresh_key: string = process.env.JWT_REFRESH_TOKEN || " ";
    

    generateTokens(userId: string): {accessToken: string, refreshToken: string} {
        const accessToken = jwt.sign({userId}, this.jwt_key, {
            expiresIn: '15m'
        });

        const refreshToken = jwt.sign({userId}, this.refresh_key, {
            expiresIn: '7d'
        });

        return {accessToken, refreshToken};
    };

    verifyAccessToken(token: string) {
        console.log( process.env.JWT_SECRET )
        return jwt.verify(token, this.jwt_key)
    };

    verifyRefreshToken(token: string){
        return jwt.verify(token, this.refresh_key);
    };
    
};
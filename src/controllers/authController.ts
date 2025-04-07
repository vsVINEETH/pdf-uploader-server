import { Request, Response, NextFunction } from "express";

import { HttpStatusCodes } from "../constants/HttpStatusCodes";
import { ResponseMessages } from "../constants/ResponseMessages";

import { IUserService } from "../services/interfaces/IUserService";
import { setCookieOptions } from "../config/cookieOptions";
import { userService } from "../services/userService";

export class AuthController {

    constructor(
        private userService: IUserService
    ){}

   login = async (req: Request, res: Response, next: NextFunction) => {
    try {
       const {email, password} = req.body;
       const {user, tokens} = await this.userService.login(email, password);

       if( user && tokens) {
         req.session.accessToken = tokens.accessToken;
         res.cookie("refreshToken", tokens.refreshToken, setCookieOptions);
         res.status(HttpStatusCodes.OK).json({user, message:ResponseMessages.SUCCESSFULLY_LOGGED_IN});
         return;
       } else if(user === false){
         res.status(HttpStatusCodes.BAD_REQUEST).json({user, message: ResponseMessages.INVALID_CREDENTIALS});
         return;
       }else{
        res.status(HttpStatusCodes.NOT_FOUND).json({message: ResponseMessages.USER_NOT_FOUND});
        return;
       }
       
    } catch (error) {
       next(error)
    };
   };
   
   logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        req.session.accessToken = null;
        res.clearCookie("refreshToken", { ...setCookieOptions, maxAge: 0 }); 
        res.status(HttpStatusCodes.ACCEPTED).json({ message: ResponseMessages.LOGGED_OUT});
        return;
    } catch (error) {
       next(error) 
    }
   };

}

export const authController = new AuthController(userService)
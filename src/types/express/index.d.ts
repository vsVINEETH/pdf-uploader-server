import 'express-session';
import 'express'
import { Multer } from 'multer';

export {Multer}
declare module 'express-session' {
    interface SessionData {
      user?:{
        id: string,
        email?: string,
      } 
      accessToken: string | null;
      email: string | null;
      authValues?:{
        email: string | null,
        role: string | null,
      }
    }
  };

  declare module 'express' {
    interface Request {
        user?:{
            userId: string,
        }
    }
}
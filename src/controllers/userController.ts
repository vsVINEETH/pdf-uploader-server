import { Request, Response, NextFunction } from "express";

import { HttpStatusCodes } from "../constants/HttpStatusCodes";
import { ResponseMessages } from "../constants/ResponseMessages";

import { IUserService } from "../services/interfaces/IUserService";
import { userService } from "../services/userService";
export class UserController {
    
    constructor(
        private userService: IUserService
    ) {};

    signup = async (req: Request, res: Response, next: NextFunction) => {
        try {
          const {name, email, password} = req.body;
          const userData = await this.userService.signup({name, email, password});

          if (userData) {
            res.status(HttpStatusCodes.OK).json({userData, message: ResponseMessages.SIGN_UP_COMPLETED});
            return;
          } else {
            res.status(HttpStatusCodes.CONFLICT).json({message: ResponseMessages.EXISTING_USER});
            return;
          }

        } catch (error) {
            next(error);
        }
    };

    uploadPDF = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.query.userId as string;
            if (!req.file) {
             res.status(HttpStatusCodes.BAD_REQUEST).json({ message: ResponseMessages});
             return;
            }
            
            const pdfFile: Express.Multer.File = req.file;
            const result = await this.userService.uploadPDF(pdfFile,userId)

            res.status(HttpStatusCodes.OK).json({data:result,message:ResponseMessages.CREATED})
            return
            
        } catch (error) {
            next(error)
        }
    };


    extract = async (req: Request, res: Response, next: NextFunction) => {
        try{
            console.log(req.body)
            const extractedPdfBuffer = await this.userService.extractPDF(req.body.fileUrl, req.body.pages);
                console.log(req.body.fileUrl,'yeah it here');
         
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename="extracted.pdf"');
                res.send(extractedPdfBuffer);

        } catch(error){
         next(error);
        }
    };

    getAllFiles = async (req: Request, res: Response, next: NextFunction) => {
        try {
          const userId = req.query.userId;
          const allFiles = await this.userService.allFiles(userId as string);
          if(allFiles){
            res.status(HttpStatusCodes.OK).json(allFiles);
            return;
          }
          res.status(HttpStatusCodes.ACCEPTED).json({message:ResponseMessages.NOT_FOUND});
          return;
        } catch (error) {
            next(error)
        };
    };

    getSelectedFile = async (req: Request, res: Response, next: NextFunction) => {
        try {
           const fileName = req.query.fileName;
           const pdfData = await this.userService.getSelectedFile(fileName as string);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="extracted.pdf"');
            res.json({
              pdfBuffer: Buffer.from(pdfData.pdfBytes).toString('base64'), // encode Buffer to base64
              signedUrl: pdfData.signedUrl
            });
           return;
        } catch (error) {
            next(error)
        }
    };

    deleteFile = async (req: Request, res: Response, next: NextFunction) => {
        try {
           const {fileName, userId} = req.query;
           const result = await this.userService.removeFile(fileName as string, userId as string);
           if(result) {
            res.status(HttpStatusCodes.OK).json({message:ResponseMessages.FILE_DELETED});
            return;
           };
           res.status(HttpStatusCodes.NOT_FOUND).json({message: ResponseMessages.NOT_FOUND});
           return;
        } catch (error) {
            next(error)
        }
    }
}


export const userController = new UserController(userService);
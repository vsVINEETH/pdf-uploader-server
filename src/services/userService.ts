import UserModel from "../models/UserModel";
import { IUserService } from "./interfaces/IUserService";
import { IBcrypt } from "./interfaces/IBcrypt";
import { IToken } from "./interfaces/IToken";
import { IS3Client } from "./interfaces/IS3Client";
import { Bcrypt } from "./Bcrypt";
import { Token } from "./Jwt";
import { S3ClientAccessControll } from "./S3Client";
import { PDFDocument } from 'pdf-lib';

export class UserService implements IUserService {
    constructor(
        private bcrypt: IBcrypt,
        private token: IToken,
        private s3: IS3Client
    ){};



    generateToken(userId: string,): { accessToken: string; refreshToken: string } {
        try {
            return this.token.generateTokens(userId);
        } catch (error) {
            throw new Error("something happend in generateToken");
        }
    };

    login = async(email: string, password: string): Promise<{
        user: {userId: string, name: string, email: string, pdfFiles: {
            fileName: string;
            s3Url: string;
            uploadedAt: Date;
        }[]} | null | boolean;
        tokens: { accessToken: string; refreshToken: string } | null;
    }> => {
        try {
            const user = await UserModel.findOne({email});
            if(!user){
                return { user: null, tokens: null};  
            };
            const passwordCheck = user.password 
                ? await this.bcrypt.compare(password, user.password)
                : false;
            if(passwordCheck) {
                const tokens = this.generateToken(user.id || user._id);

                return {
                    user:{
                        userId: user?.id || user?._id,
                        name: user.name,
                        email: user.email,
                        pdfFiles: user.pdfFiles,
                    },
                    tokens: tokens,
                };
            };
            return { user: false, tokens: null };      
        } catch (error) {
            throw new Error('something happend to login')
        }
    } 
            
    signup = async(signupData: any): Promise< any | null> => {
        try {
            const existingUser = await UserModel.findOne({email: signupData.email});
            if(existingUser) {return null};

            const hashedPassword = await this.bcrypt.Encrypt(signupData.password);
            await UserModel.create({
                name: signupData.name,
                email: signupData.email,
                password: hashedPassword,
            });

            return {name: signupData.name, email: signupData.email}
        } catch (error) {
        throw new Error('something happend in signup') 
        };
    };

    uploadPDF = async (pdfData: Express.Multer.File, userId: string): Promise<any> => {
        try {

          const fileName = await this.s3.uploadToS3(pdfData);
      
          const pdfEntry = {
            fileName,
            uploadedAt: new Date(),
          };

          const signedUrl = await this.s3.retrieveFromS3(fileName);
          const result = await UserModel.findByIdAndUpdate(
            userId,
            { $push: { pdfFiles: pdfEntry } },
            { new: true }
          );
      
          return {result, signedUrl, fileName};
        } catch (error) {
          console.error(error);
          throw new Error("Something happened in uploadPDF");
        }
      };

      extractPDF = async (fileUrl: string, pages: number[]): Promise<any> => {
        try {
            const res = await fetch(fileUrl);
            const arrayBuffer = await res.arrayBuffer();
            const pdfBytes = new Uint8Array(arrayBuffer);

            const pdfDoc = await PDFDocument.load(pdfBytes);

            // 3. Create new PDF and copy selected pages
            const newPdf = await PDFDocument.create();
            const copiedPages = await newPdf.copyPages(pdfDoc, pages.map(p => p - 1));
            copiedPages.forEach(page => newPdf.addPage(page));

            // 4. Return new PDF as Buffer
            const newPdfBytes = await newPdf.save();
            return Buffer.from(newPdfBytes);
        } catch (error) {
           throw new Error("somthing happend in extractPDF");
        }
      };

      allFiles = async (userId: string): Promise<any> => {
        try {
           const result = await UserModel.findById(userId);
           return result
                ? result.pdfFiles.sort((a, b) => {
                    return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
                    })
                : null;
        } catch (error) {
            throw new Error('something happend in allFiles')
        }
      }

      getSelectedFile = async (fileName: string): Promise<any> => {
        try {
            const signedUrl = await this.s3.retrieveFromS3(fileName);

            const res = await fetch(signedUrl);
            const arrayBuffer = await res.arrayBuffer();
            const pdfBytes = new Uint8Array(arrayBuffer);
        
            return {pdfBytes, signedUrl};

        } catch (error) {
           throw new Error('something happend in getSelectedFile') 
        };
      };

      removeFile = async (fileName: string, userId: string): Promise<boolean> => {
        try {
            await this.s3.deleteFromS3(fileName);
            const result =  await UserModel.findByIdAndUpdate(
                userId,
                { $pull: { pdfFiles: { fileName } } }, // This assumes pdfFiles is an array of objects
                { new: true }
              );

            return result !== null;
        } catch (error) {
            throw new Error('something hanppend in removeFile')
        }
      }
      
}

export const userService = new UserService(new Bcrypt, new Token, new S3ClientAccessControll)
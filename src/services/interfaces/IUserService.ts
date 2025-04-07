export interface IUserService {
     login (email: string, password: string):Promise<{
        user: {userId: string, name: string, email: string, pdfFiles: {
            fileName: string;
            s3Url: string;
            uploadedAt: Date;
          }[]} | null | boolean;
        tokens: { accessToken: string; refreshToken: string } | null;
    }>
     signup (signupData: any): Promise< any | null>
     uploadPDF (pdfData: Express.Multer.File, userId: string): Promise<any>
     extractPDF (file: string, pages: number[]): Promise<any>;
     allFiles(userId: string): Promise<any>;
     getSelectedFile (fileName: string): Promise<any>
     removeFile (fileName: string, userId: string): Promise<boolean>
};
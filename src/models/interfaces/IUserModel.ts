import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  pdfFiles: {
    fileName: string;
    s3Url: string;
    uploadedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
};
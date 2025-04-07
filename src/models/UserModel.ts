import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./interfaces/IUserModel";

const UserSchema: Schema = new Schema<IUser>(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
      },
      password: {
        type: String,
        required: true,
        trim: true,
      },
      pdfFiles: [
        {
          fileName: { type: String, required: true },
          s3Url: { type: String, required: true },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
    },
    {
      timestamps: true,
    }
  );
  
  export default mongoose.model<IUser>("User", UserSchema);
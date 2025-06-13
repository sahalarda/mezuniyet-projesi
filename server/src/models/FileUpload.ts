import { Schema, model } from "mongoose";

interface IFileUpload {
  userId: Schema.Types.ObjectId; // Reference to the user
  filename: string;
  path: string;
  uploadDate: Date;
  summary: string;
  score: number;
  comment?: string;
}

const FileUploadSchema = new Schema<IFileUpload>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  summary: { type: String },
  score: { type: Number, min: 0, max: 100 },
  comment: { type: String, required: false },
});

export const FileUpload = model<IFileUpload>("FileUpload", FileUploadSchema);

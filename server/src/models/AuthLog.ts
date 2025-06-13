// models/AuthLog.ts

import { Schema, model } from "mongoose";

interface IAuthLog {
  userId: string;
  action: "login" | "signup";
  timestamp: Date;
  ipAddress: string;
}

const AuthLogSchema = new Schema<IAuthLog>({
  userId: { type: String, required: true },
  action: { type: String, required: true, enum: ["login", "signup"] },
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String, required: true },
});

export const AuthLog = model<IAuthLog>("AuthLog", AuthLogSchema);

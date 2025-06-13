import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import nodemailer from "nodemailer";
import path from "path";
import { AuthLog } from "../models/AuthLog";
import { FileUpload } from "../models/FileUpload";
import { Role, User } from "../models/User";
import { authenticateJWT, generateToken } from "../utils/auth";
import mongoose from "mongoose";

dotenv.config();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    /*Appending extension with original name*/
    cb(null, file.originalname + path.extname(file.originalname));
  },
});

const upload = multer({ dest: "uploads/", storage });
const router = express.Router();

// Set up the email transporter using Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.EMAIL_PORT) || 0,
  secure: true,
  auth: {
    user: process.env.SMTP_ADMIN_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, surname, password, studentNumber } = req.body;

    // Check if user or student number already exists
    const [existingStudentNumber] = await Promise.all([User.findOne({ studentNumber })]);

    if (existingStudentNumber) {
      res.status(400).send("This student number is already used.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = new User({
      name,
      surname,
      password: hashedPassword,
      role: Role.Student,
      studentNumber,
      verificationToken,
    });

    await user.save();

    // Log the signup action
    await AuthLog.create({
      userId: user._id,
      action: "signup",
      ipAddress: req.ip,
    });

    const verificationUrl = `${process.env.BASE_URL}/api/users/verify-email?token=${verificationToken}`;
    const mailOptions = {
      from: process.env.SMTP_ADMIN_EMAIL,
      to: `${studentNumber}@ogr.akdeniz.edu.tr`,
      subject: "Email Verification",
      text: `Click the link to verify your email: ${verificationUrl}`,
    };

    transporter.sendMail(mailOptions, (error: Error | null) => {
      if (error) {
        console.error("Error sending verification email:", error);
        return res.status(500).send("Error sending email.");
      }
      res.status(201).send("User registered successfully. Check your email to verify.");
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).send("An unexpected error occurred. Please try again later.");
  }
});

router.get("/verify-email", async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token) {
      res.status(400).send("Invalid verification token.");
      return;
    }

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      res.status(404).send("User not found.");
      return;
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.send("Email verified successfully! Your account is now activated.");
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email,
      password,
    }: {
      email: string;
      password: string;
    } = req.body;

    let user;

    // Check for admin/teacher special logins
    if (email === "admin@gmail.com") {
      user = await User.findOne({ role: Role.Admin });
    } else if (email === "teacher@gmail.com") {
      user = await User.findOne({ role: Role.Teacher });
    } else {
      // Regular student login
      console.log("email", email)
      console.log("email.split", email.split("@")[0])
      user = await User.findOne({ studentNumber: email.split("@")[0] });
    }

    console.log("user", user)
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).send("Invalid credentials");
      return;
    }

    // Only check verification for students
    if (user.role === Role.Student && !user.isVerified) {
      res.status(401).send("Email not verified");
      return;
    }

    const token = generateToken(user._id.toString());
    res.json({ token, ...user.toJSON() });

    // Log the login action
    await AuthLog.create({
      userId: user._id,
      action: "login",
      ipAddress: req.ip,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/upload-pdf", authenticateJWT, upload.single("pdf"), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const summary = req.body.summary;

    if (!userId || !req.file) {
      res.status(400).send("Invalid file upload");
      return;
    }

    if (path.extname(req.file.originalname) !== ".pdf") {
      res.status(400).send("Only PDF files are allowed");
      return;
    }

    const fileUpload = new FileUpload({
      userId: userId,
      filename: req.file.filename,
      path: req.file.path,
      summary: summary,
    });

    const savedFile = await fileUpload.save();

    res.json(savedFile);
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/auth-logs", authenticateJWT, async (req, res) => {
  try {
    const logs = await AuthLog.find().sort({ timestamp: -1 }).limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).send("Error fetching logs");
  }
});

router.get("/uploaded-docs", authenticateJWT, async (req, res) => {
  try {
    const uploads = await FileUpload.find().populate("userId", "name surname studentNumber").sort({ createdAt: -1 });

    res.json(uploads);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).send("Error fetching documents");
  }
});

router.get("/download/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const file = await FileUpload.findById(id);

    if (!file) {
      res.status(404).send("File not found");
      return;
    }

    const filePath = path.resolve(file.path);
    res.download(filePath, file.filename, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).send("Error downloading file");
      }
    });
  } catch (error) {
    console.error("Download Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Add route to update document score
router.patch("/score/:id", authenticateJWT, async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { score, comment } = req.body;

    // Basic validation for score
    if (score === undefined || score === null) {
      res.status(400).send("Score is required.");
      return;
    }
    
    const scoreNumber = Number(score);
    if (isNaN(scoreNumber) || scoreNumber < 0 || scoreNumber > 100) {
      res.status(400).send("Invalid score. Must be a number between 0 and 100.");
      return;
    }

    // Prepare update data
    const updateData: { score: number; comment?: string } = { score: scoreNumber };
    if (comment !== undefined) {
      updateData.comment = comment;
    }

    // Find and update the document using findByIdAndUpdate
    const updatedFile = await FileUpload.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedFile) {
      res.status(404).send("Document not found.");
      return;
    }

    // TODO: Add authorization check - only teachers/admins should be able to score?
    // Note: Authorization might need to be checked *before* the update 
    // if you fetch the user role separately or from the JWT payload.
    // const userRole = (req as any).user?.role;
    // if (userRole !== Role.Teacher && userRole !== Role.Admin) {
    //   res.status(403).send("Forbidden: Only teachers or admins can assign scores.");
    //   return; 
    // }

    res.json({ message: "Score and comment updated successfully", file: updatedFile });

  } catch (error) {
    console.error("Score Update Error:", error);
    if (error instanceof mongoose.Error.CastError) {
       res.status(400).send("Invalid document ID format.");
    } else {
       res.status(500).send("Internal Server Error updating score.");
    }
  }
});

// Add route to get latest project for the currently authenticated user
router.get("/me/projects", authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).send("Authentication required");
      return;
    }

    console.log("User ID from token:", userId);

    // Get the most recent project (default behavior)
    const latestProject = await FileUpload.findOne({ userId })
      .sort({ uploadDate: -1 })
      .select('filename uploadDate score')
      .lean();
    
    if (!latestProject) {
      res.status(404).send("No projects found for this user");
      return;
    }

    console.log("Latest project found:", latestProject);

    res.json({
      id: latestProject._id,
      title: latestProject.filename,
      score: latestProject.score
    });

  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to get all users (Admin only)
router.get("/all", authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  try {
    const requester = (req as any).user;

    //get user by id
    const user = await User.findById(requester.id);


    console.log("user", user)
    // Check if the requester is an Admin
    if (!user || user.role !== Role.Admin) {
      res.status(403).send("Forbidden: Only admins can access this resource.");
      return;
    }

    const users = await User.find({}, '-password -verificationToken').lean(); // Exclude password and token
    res.json(users);

  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to delete a user (Admin only)
router.delete("/:id", authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  try {
    const requester = (req as any).user;
    const userToDeleteId = req.params.id;

    // Get the requester's full user object to check role
    const adminUser = await User.findById(requester.id);

    // Check if the requester is an Admin
    if (!adminUser || adminUser.role !== Role.Admin) {
      res.status(403).send("Forbidden: Only admins can delete users.");
      return;
    }

    // Check if trying to delete the last admin
    if (adminUser._id.toString() === userToDeleteId) {
      const adminCount = await User.countDocuments({ role: Role.Admin });
      if (adminCount <= 1) {
        res.status(400).send("Cannot delete the last admin user.");
        return;
      }
    }

    // Find and delete the user
    const deletedUser = await User.findByIdAndDelete(userToDeleteId);

    if (!deletedUser) {
      res.status(404).send("User not found.");
      return;
    }

    // Delete all associated auth logs
    await AuthLog.deleteMany({ userId: userToDeleteId });

    // Delete all associated file uploads
    const userFiles = await FileUpload.find({ userId: userToDeleteId });
    
    // Delete the physical files
    for (const file of userFiles) {
      try {
        const filePath = path.resolve(file.path);
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.error(`Error deleting file ${file.filename}:`, err);
        // Continue with other deletions even if one file fails
      }
    }

    // Delete the file records from database
    await FileUpload.deleteMany({ userId: userToDeleteId });

    res.status(200).send("User and all associated data deleted successfully.");

  } catch (error) {
    console.error("Error deleting user:", error);
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).send("Invalid user ID format.");
    } else {
      res.status(500).send("Internal Server Error");
    }
  }
});

export default router;

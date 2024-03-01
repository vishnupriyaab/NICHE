import { Request, Response } from "express";
import * as nodemailer from "nodemailer";
import Mailgen from "mailgen";


// Function to generate a 4-digit OTP
let otp: string = "0";

export function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Function to send an email with OTP
export async function   sendEmailWithOTP(email: string , otp:string): Promise<string> {
  // Create an OTP
  
  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.AUTH_MAIL,
      pass: process.env.AUTH_PASS,
    },
  });

  // Create a Mailgen instance
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "NICHE",
      link: "https://yourapp.com",
    },
  });

  // Generate an email body with the OTP
  const emailBody = {
    body: {
      intro: `Your OTP is:${otp}`,

      outro: "Don't share this OTP with anyone.",
    },
  };

  // Generate the email
  const emailTemplate = mailGenerator.generate(emailBody);
  const emailText = mailGenerator.generatePlaintext(emailBody);

  // Send the email
  const mailOptions: nodemailer.SendMailOptions = {
    from: "vishnupriyaotp2002@gmail.com",
    to: email,
    subject: "Your OTP for Your App",
    text: emailText,
    html: emailTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", otp);
    return otp;
  } catch (error) {
    console.error("Error sending email: ", (error as Error).message);
    throw error;
  }
}


export function verifyOtp(val: string,otp:string) {
  return parseInt(val) === parseInt(otp);
}

import { Request, Response } from 'express';
import * as nodemailer from 'nodemailer';
import  Mailgen  from 'mailgen';

// Function to generate a 4-digit OTP
let otp:string = "0"

export function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Function to send an email with OTP
export async function sendEmailWithOTP(email: string): Promise<string> {
  // Create an OTP
   otp = generateOTP();  

  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // e.g., 'gmail'
    auth: {
      user: 'vishnupriyaotp2002@gmail.com',
      pass: 'deuw ojyo qddm sdwr',
    },
  });

  // Create a Mailgen instance
  const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'NICHE',
      link: 'https://yourapp.com',
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
    from: 'vishnupriyaotp2002@gmail.com',
    to: email,
    subject: 'Your OTP for Your App',
    text: emailText,
    html: emailTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', otp);
    
    return otp;
  } catch (error) {
    console.error('Error sending email: ', (error as Error).message);
    throw error;
  }
}

export function otpSnd(req: Request, res: Response): void {
  try {
    // Assuming that the email is provided in the request body
    const userEmail: string = req.body.email;

    // Call the function to send email with OTP
    sendEmailWithOTP(userEmail)
      .then((otp) => {
        console.log('OTP sent successfully:', otp);
        res.send('OTP Sent Successfully');
      })
      .catch((error) => {
        console.error('Failed to send OTP:', (error as Error));
        res.status(500).send('Failed to send OTP');
      });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
}

export  function verifyOtp(val : string){
  console.log(typeof val);
  console.log(typeof otp);
  
  return parseInt(val) === parseInt(otp)
}

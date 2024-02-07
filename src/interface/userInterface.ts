export interface UserRequestBody {
  Email: string;
  UserName: string;
  Password: string;
  Phone: string;
  otp:string
}

// global express-session = add custom values
declare module "express-session" {
  interface SessionData {
    userId: string;
    isAuth:boolean
  }
}
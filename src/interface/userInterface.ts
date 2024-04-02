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
    adminId: string
    Email: string
    otp:string
    addressId:string;
    couponCode: string
  }
}

interface User {
  username: string;
  email: string;
  phone: number;
  password: string;
  block: Boolean;
  liveStatus: Boolean;
  refferalOfferToken: string;
  refferedToken: string;
}

export default User
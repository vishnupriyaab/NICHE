import { Request,Response } from "express";
import adminDb, { IAdmin } from "../model/adminModel";
import bcrypt from "bcrypt"
import categoryDb from "../model/categoryModel";

interface body {
  email: string;
  password: string;
}
let loginError: string | null = null;



export async function getDashboard(req: Request, res: Response) {
    try {
      res.render("admin/dashboard");
    } catch (error: any) {
      console.error(error);
    }
  }
  export async function getUsers(req: Request, res: Response) {
    try {
      res.render("admin/users");
    } catch (error: any) {
      console.error(error);
    }
  }
  export async function getCategory(req: Request, res: Response) {
    try {
      
      const category = await categoryDb.find();
      console.log(category);
      res.render("admin/category",{category});
    } catch (error: any) {
      console.error(error);
    }
  }

export async function addCategory(req: Request, res:Response) {
  try {
    const {name} = req.body;
    const newCategory = new categoryDb({
      name: name
    })
     await newCategory.save()
res.redirect("/category")
  } catch (error) {
    console.log(error);
  }
}

  export async function getProducts(req: Request, res: Response) {
    try {
      res.render("admin/products");
    } catch (error: any) {
      console.error(error);
    }
  }

  export async function getAdminlogin(
    req: Request<{}, {}, body>,
    res: Response
  ): Promise<void> {
    try {
      res.render("admin/adminLogin", { loginError: loginError });
      loginError = null;
      return;
    } catch (error: any) {
      console.error(error);
    }
  }


  const adminEmail = process.env.ADMIN_ID;
  const adminPassword = process.env.ADMIN_PASS;

// interface IAdminAuth{
//   email :string,
//   password : string
// }


  export async function isAdmin(req: Request <{}, {},IAdmin>, res: Response) {
    try {
      
      console.log(req.body,"body");
      const {email,password,role} = req.body;
      const admin = await adminDb.findOne({ email });
      // if( === adminE && inputPassword === adminPassword){
      //   req.session.isAuth = true;
      //   res.status(200).redirect("/dashboard");
        console.log(admin);
      if (admin) {
        const match = await bcrypt.compare(password,admin.password);
        if (match) {
          req.session.adminId = admin.id;
          loginError = null;
          res.redirect("/dashboard");
        } else {
          loginError = "Invalid password";
          res.redirect("/adminlogin");
        }
      } else {
        loginError = "User not found";
        res.redirect("/adminlogin");
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).render("Internal Server Error");
    }
  }



  export async function adminRegister(req:Request<{},{},IAdmin>,res:Response){
    try {
      const {email,password,role} = req.body;
        const newUser = new adminDb({
          email,
          password,
          role,
        });
        await newUser.save();
        res.status(201).json("Registered Successfully");
    } catch (error:any) {
      console.log(error);
      if(error.code==11000){
        res.json({message:"data already exists"})
      }else{
        res.json(error)
      }
    }
  }


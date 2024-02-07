import { Request,Response } from "express";


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
      res.render("admin/category");
    } catch (error: any) {
      console.error(error);
    }
  }
  export async function getProducts(req: Request, res: Response) {
    try {
      res.render("admin/products");
    } catch (error: any) {
      console.error(error);
    }
  }
  export async function getAdminlogin(req: Request, res: Response) {
    try {
      res.render("admin/adminLogin");
    } catch (error: any) {
      console.error(error);
    }
  }

  const adminEmail = process.env.ADMIN_ID;
  const adminPassword = process.env.ADMIN_PASS;

interface IAdminAuth{
  email :string,
  password : string
}


  export async function isAdmin(req: Request <{}, {},IAdminAuth>, res: Response) {
    try {
      const {email:inputEmail , password:inputPassword} = req.body;
      console.log(req.body,"body");
      
      if(inputEmail === adminEmail && inputPassword === adminPassword){
        req.session.isAuth = true;
        res.status(200).redirect("/dashboard");
        console.log("success");
        
      }else{
        res.status(200).redirect("/adminLogin")
        console.log("failed");
        
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).render("Internal Server Error");
    }
  }
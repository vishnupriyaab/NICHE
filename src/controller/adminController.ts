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
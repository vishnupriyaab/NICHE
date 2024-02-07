import{ Router }from "express";
import { getAdminlogin, getCategory, getDashboard, getProducts, getUsers } from "../controller/adminController";

    
const adminRoute:Router = Router();
adminRoute.get("/dashboard",getDashboard);
adminRoute.get("/users",getUsers);
adminRoute.get("/category",getCategory);
adminRoute.get("/products",getProducts);
adminRoute.get("/adminLogin",getAdminlogin);

export default adminRoute;
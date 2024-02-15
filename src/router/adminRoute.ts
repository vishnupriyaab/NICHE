import{ Router }from "express";
import { addCategory, adminRegister, getAdminlogin, getCategory, getDashboard, getProducts, getUsers, isAdmin } from "../controller/adminController";
import { adminLoginValidation, validateadminRegistration } from "../middleware/adminAuth";
import { categoryValidation, validateCategory } from "../middleware/categoryAuth";

    
const adminRoute:Router = Router();
adminRoute.get("/dashboard",getDashboard);
adminRoute.get("/users",getUsers);
adminRoute.get("/category",getCategory);
adminRoute.get("/products",getProducts);
adminRoute.get("/adminlogin",getAdminlogin);



// adminRoute.post("/adminAuth",adminLoginValidation,validateadminRegistration, isAdmin);
adminRoute.post("/adminlogin",adminLoginValidation,validateadminRegistration,isAdmin);
adminRoute.post("/adminRegister",adminRegister);
adminRoute.post("/addcategory",categoryValidation,validateCategory,addCategory);

export default adminRoute;
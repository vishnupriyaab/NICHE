import { Router } from "express";
import { addCategory, addproduct, adminRegister, editCategory, getAdminlogin, getCategory, getDashboard, getProducts, getUsers, getaddProduct, isAdmin, listCategory, unlistCategory } from "../controller/adminController";
import { adminLoginValidation, validateadminRegistration } from "../middleware/adminAuth";
import { categoryValidation, editcategoryValidation, editvalidateCategory, validateCategory } from "../middleware/categoryAuth";

    
const adminRoute:Router = Router();
adminRoute.get("/dashboard",getDashboard);
adminRoute.get("/users",getUsers);
adminRoute.get("/category",getCategory); 
adminRoute.get("/products",getProducts);
adminRoute.get("/adminlogin",getAdminlogin);
adminRoute.get("/addProduct",getaddProduct);


adminRoute.post("/adminlogin",adminLoginValidation,validateadminRegistration,isAdmin);
adminRoute.post("/adminRegister",adminRegister);
adminRoute.post("/addcategory",categoryValidation,validateCategory,addCategory);
adminRoute.post("/addProduct",addproduct)


adminRoute.patch("/listCategory", listCategory);
adminRoute.patch("/unlistCategory", unlistCategory);
adminRoute.patch("/editcategory",editcategoryValidation,editvalidateCategory, editCategory);

export default adminRoute;
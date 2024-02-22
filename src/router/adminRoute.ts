import { Router } from "express";
import { addCategory, addproduct, adminRegister, deleteImage, deleteProduct, editCategory, getAdminlogin, getCategory, getDashboard, getEditproduct, getProducts, getUsers, getaddProduct, getunlistedProduct, isAdmin, listCategory, restoreProduct, unlistCategory, updateproduct } from "../controller/adminController";
import { adminLoginValidation, validateadminRegistration } from "../middleware/adminAuth";
import { categoryValidation, editcategoryValidation, editvalidateCategory, validateCategory } from "../middleware/categoryAuth";

    
const adminRoute:Router = Router();
adminRoute.get("/dashboard",getDashboard);
adminRoute.get("/users",getUsers);
adminRoute.get("/category",getCategory); 
adminRoute.get("/products",getProducts);
adminRoute.get("/adminlogin",getAdminlogin);
adminRoute.get("/addProduct",getaddProduct);
adminRoute.get("/unlistedProduct",getunlistedProduct);
adminRoute.get("/editProduct/:id",getEditproduct);


adminRoute.post("/adminlogin",adminLoginValidation,validateadminRegistration,isAdmin);
adminRoute.post("/adminRegister",adminRegister);
adminRoute.post("/addcategory",categoryValidation,validateCategory,addCategory);
adminRoute.post("/addProduct",addproduct)
adminRoute.post("/deleteproduct",deleteProduct);
adminRoute.post("/restoreproduct",restoreProduct);

adminRoute.patch("/listCategory", listCategory);
adminRoute.patch("/unlistCategory", unlistCategory);
adminRoute.patch("/editcategory",editcategoryValidation,editvalidateCategory, editCategory);


adminRoute.put("/updateproduct/:id", updateproduct);


adminRoute.delete("/deleteimage/:id/:productid", deleteImage)


export default adminRoute;
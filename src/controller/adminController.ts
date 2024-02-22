import { Request, Response } from "express";
import adminDb, { IAdmin } from "../model/adminModel";
import bcrypt from "bcrypt";
import categoryDb from "../model/categoryModel";
import cloudinaryUploadImage from "../config/cloudinary";
import { Product } from "../interface/productInterface";
import productDb from "../model/productModel";

interface body {
  email: string;
  password: string;
  id: string;
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
    // console.log(category);
    res.render("admin/category", { category });
  } catch (error: any) {
    console.error(error);
  }
}

export async function addCategory(req: Request, res: Response) {
  try {
    const { name } = req.body;
    console.log(name);
    const cname = name.toUpperCase().trim();

    const alreadyExisted = await categoryDb.findOne({ name: cname });

    if (alreadyExisted) {
      res.send("Already Existed");
    } else {
      const newCategory = new categoryDb({
        name: cname,
      });
      await newCategory.save();
      res.send("success");
      console.log("susxcvb");
    }
  } catch (error) {
    console.log(error);
  }
}

export async function editCategory(req: Request, res: Response) {
  try {
    const { name, id } = req.body;
    const cname = name.toUpperCase().trim();

    const alreadyExisted = await categoryDb.findOne({ name: cname });
    if (alreadyExisted) {
      res.send("Already Existed");
    } else {
      console.log(id);

      await categoryDb.updateOne({ _id: id }, { $set: { name: cname } });
      res.send("success");
      console.log("susxcvb");
    }
  } catch (error) {
    console.log(error);
  }
}

export async function unlistCategory(req: Request, res: Response) {
  try {
    const data = await categoryDb.findOneAndUpdate(
      { _id: req.body.id },
      { $set: { unlistStatus: false } }
    );
    if (data) {
      res.status(200).json({ status: true });
    } else {
      res.status(401).json({
        message: "Invalid Id",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function listCategory(req: Request, res: Response) {
  try {
    const data = await categoryDb.findOneAndUpdate(
      { _id: req.body.id },
      { $set: { unlistStatus: true } }
    );
    if (data) {
      res.status(200).json({ status: true });
    } else {
      res.status(401).json({
        message: "Invalid Id",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function getProducts(req: Request, res: Response) {
  try {
    const product = await productDb.find().populate("category");
    res.render("admin/products", { product });
  } catch (error: any) {
    console.error(error);
  }
}

export async function getEditproduct(req:Request, res:Response) {
  try {
    const product = await productDb.findOne({ _id: req.params.id })
    const category = await categoryDb.find()
    
    res.status(200).render("admin/editProduct", { product,category });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function getunlistedProduct(req: Request, res: Response) {
  try {
    const product = await productDb.find().populate("category");
    res.render("admin/unlistedProduct", { product });
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

export async function updateproduct(req:Request, res:Response) {
  try {    
    let { productname, description, price, stock, imgArr, category } = req.body;
    const categoryname = await categoryDb.findOne({name:category})
    const url = await cloudinaryUploadImage(imgArr);
    await productDb.updateOne(
      { _id: req.params.id },
      {
        $set: {
          productname,
          description,
          price,
          stock,
          category,
          // imgArr:url
        },
      }
    );

    await productDb.updateOne(
      { _id: req.params.id },
      { $push: { imgArr: { $each: url } } },
      { upsert: true }
    );

    res.status(200).send(true);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}


const adminEmail = process.env.ADMIN_ID;
const adminPassword = process.env.ADMIN_PASS;

export async function isAdmin(req: Request<{}, {}, IAdmin>, res: Response) {
  try {
    console.log(req.body, "body");
    const { email, password, role } = req.body;
    const admin = await adminDb.findOne({ email });
    // if( === adminE && inputPassword === adminPassword){
    //   req.session.isAuth = true;
    //   res.status(200).redirect("/dashboard");
    console.log(admin);
    if (admin) {
      const match = await bcrypt.compare(password, admin.password);
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



export async function deleteImage(req:Request, res:Response) {
  try {
    const imagePublicId = req.params.id;
    console.log(imagePublicId);
    
    const { productid } = req.params;
    console.log(req.params);
    
   const data = await productDb.updateOne(
      { _id: productid },
      {
        $unset: {
          [`imgArr.${Number(imagePublicId)}`]: 1,
        },
      }
    );

    console.log(data);
    

    await productDb.findOneAndUpdate(
      { _id: productid },
      {
        $pull: {
          imgArr: null,
        },
      }
    );

    res.status(200).send(true);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting image reference");
  }
}

export async function adminRegister(
  req: Request<{}, {}, IAdmin>,
  res: Response
) {
  try {
    const { email, password, role } = req.body;
    const newUser = new adminDb({
      email,
      password,
      role,
    });
    await newUser.save();
    res.status(201).json("Registered Successfully");
  } catch (error: any) {
    console.log(error);
    if (error.code == 11000) {
      res.json({ message: "data already exists" });
    } else {
      res.json(error);
    }
  }
}

export async function getaddProduct(req: Request, res: Response) {
  try {
    const category = await categoryDb.find();
    // console.log(category);

    res.render("admin/addProduct", { category });
  } catch (error: any) {
    res.status(500).send("Internal Server Error");
  }
}



export async function addproduct(req: Request<{}, {}, Product>, res: Response) {
  try {
    let { name, description, price, stock, imgArr, category } = req.body;
    const catID = await categoryDb.findById(category);
    const url = await cloudinaryUploadImage(imgArr);
    const newCat = new productDb({
      name,
      description,
      price,
      stock,
      imgArr: url,
      category: catID,
    });
    const saved = await newCat.save();
    if (saved) {
      return res.status(201).json({ message: "Product Added" });
    }

    // Add a return statement here if necessary
    return res.status(500).send("Internal Server Error");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const data = await productDb.updateOne(
      { _id: req.body.id },
      { $set: { isHidden: true } }
    );

    if (data) res.status(200).send(false);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function restoreProduct(req:Request, res:Response) {
  try {
    const data = await productDb.updateOne(
      { _id: req.body.id },
      { $set: { isHidden: false } }
    );

    if (data) res.status(200).send(true);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}
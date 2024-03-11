import { Request, Response } from "express";
import productDb from "../../model/productModel";
import categoryDb from "../../model/categoryModel";
import cloudinaryUploadImage from "../../config/cloudinary";
import { Product } from "../../interface/productInterface";
import { getListedProducts } from "../../config/dbHelper";
import userDb from "../../model/userModel";

export async function getProducts(req: Request, res: Response) {
  try {
    const products = await productDb.find().populate("category");
    const page: boolean | undefined =
      req.query.page === "true" ? true : undefined;
    const product = await getListedProducts(page);
    const totalProducts = products.length;
    res.render("admin/products", {
      product,
      totalProducts,
      currentPage: Number(req.query.page),
    });
  } catch (error: any) {
    console.error(error);
  }
}

export async function getEditproduct(req: Request, res: Response) {
  try {
    const product = await productDb.findOne({ _id: req.params.id });
    const category = await categoryDb.find();

    res.status(200).render("admin/editProduct", { product, category });
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

export async function updateproduct(req: Request, res: Response) {
  try {
    let { productname, description, price, stock, imgArr, category } = req.body;
    const categoryname = await categoryDb.findOne({ name: category });
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

export async function deleteImage(req: Request, res: Response) {
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

export async function getaddProduct(req: Request, res: Response) {
  try {
    const category = await categoryDb.find({ unlistStatus: true });
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

export async function restoreProduct(req: Request, res: Response) {
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

import { Request, Response } from "express";
import categoryDb from "../../model/categoryModel";
import { getListedAllCategories } from "../../config/dbHelper";

export async function getCategory(req: Request, res: Response) {
  try {
    const selectedCat = req.query.filter || "ALL";

    const allCategories = await categoryDb.find();
    const page: number | undefined =
      typeof req.query.page === "string" ? parseInt(req.query.page) : undefined;
    const category = await getListedAllCategories(false, page);
    const totalCategories = allCategories.length;
    res.render("admin/category", {
      allCategories,
      selectedCat,
      category,
      totalCategories,
      currentPage: Number(req.query.page),
    });
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
      await categoryDb.updateOne({ _id: id }, { $set: { name: cname } });
      res.send("success");
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

export async function getCategorySearch(req: Request, res: Response) {
  try {
    const payLoad = req.body.payLoad.trim();
    let search = await categoryDb.find({
      name: { $regex: new RegExp("^" + payLoad + ".*", "i") },
    });
    search = search.slice(0, 10);
    res.status(200).json({ payLoad: search });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

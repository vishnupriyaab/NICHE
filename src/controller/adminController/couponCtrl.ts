import { getAllCoupon, getAllDeletedCoupons } from "../../config/dbHelper";
import categoryDb from "../../model/categoryModel";
import CouponDb from "../../model/couponModel";
import { Request, Response } from "express";

export async function adminCoupon(req: Request, res: Response) {
  try {
    const allcoupons = await CouponDb.find();
    const category = await categoryDb.find();
    const page = req.query.page ? parseInt(req.query.page as string, 10) : null;
    const coupons = await getAllCoupon(null, page);

    const totalCoupons = allcoupons.length;
    console.log(coupons);

    res.render("admin/adminCoupon", {
      coupons,
      totalCoupons,
      category,
      currentPage: Number(req.query.page),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function adminAddCoupon(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const category = await categoryDb.find();
    res.render("admin/adminAddCoupon", { category });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function addCoupon(req: Request, res: Response): Promise<void> {
  try {
    const { couponCode, category, maxUse, priceLimit, coupondiscount, expiry } =
      req.body;
    const regexCode = new RegExp(couponCode, "i");

    const duplicate = await CouponDb.findOne({
      couponCode: { $regex: regexCode },
    });

    if (
      !couponCode ||
      !category ||
      !maxUse ||
      !priceLimit ||
      !coupondiscount ||
      !expiry
    ) {
      res
        .status(500)
        .json({ errStatus: true, message: "Content cannot be empty" });
      return;
    }

    if (duplicate) {
      res
        .status(401)
        .json({ errStatus: true, message: "Coupon already exist" });
      return;
    }

    const newCoupon = new CouponDb({
      couponCode,
      category,
      maxUse,
      priceLimit,
      coupondiscount,
      expiry,
    });

    await newCoupon.save();

    res.status(201).json({ message: "Coupon Added" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function adminEditCoupon(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const coupon = await CouponDb.findById(id);
    const category = await categoryDb.find();
    res.render("admin/adminEditCoupon", { coupon, category });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function updateCoupon(req: Request, res: Response): Promise<void> {
  try {
    let { couponCode, category, maxUse, priceLimit, coupondiscount, expiry } =
      req.body;
    const regexCode = new RegExp(couponCode, "i");
    // const duplicate = await Coupondb.findOne({
    //   couponCode: { $regex: regexCode },
    // });

    const duplicate = await CouponDb.findOne({
      couponCode: { $regex: new RegExp("^" + couponCode + "$", "i") },
      _id: { $ne: req.params.id }, // Exclude the current coupon being updated
    });

    if (!couponCode) {
      res.status(401).json({ errStatus: true, message: "Field is Required" });
      return;
    }

    if (!category) {
      res.status(401).json({ errStatus: true, message: "Field is Required" });
      return;
    }

    if (!maxUse) {
      res.status(401).json({ errStatus: true, message: "Field is Required" });
      return;
    }

    if (!priceLimit) {
      res.status(401).json({ errStatus: true, message: "Field is Required" });
      return;
    }

    if (!coupondiscount) {
      res.status(401).json({ errStatus: true, message: "Enter Discount" });
      return;
    }

    if (!expiry) {
      res.status(401).json({ errStatus: true, message: "Select the Date" });
      return;
    }

    if (duplicate) {
      res
        .status(401)
        .json({ errStatus: true, message: "Coupon already exist" });
      return;
    }

    const newCoupon = await CouponDb.updateOne(
      { _id: req.params.id },
      {
        $set: {
          couponCode,
          category,
          maxUse,
          priceLimit,
          coupondiscount,
          expiry,
        },
      }
    );
    if (newCoupon) {
      res.status(201).json({ message: "Coupon Updated" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function adminDeletedCoupon(req: Request, res: Response) {
  try {
    const allcoupons = await CouponDb.find();
    const coupons = await getAllDeletedCoupons(
      null,
      req.query.page as undefined
    );
    const totalCoupons = allcoupons.length;
    console.log(coupons);

    res.render("admin/adminDeletedCoupons", {
      coupons,
      totalCoupons,
      currentPage: Number(req.query.page),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function deleteCoupon(req: Request, res: Response): Promise<void> {
  try {
    const couponId = req.params.id;
    const data = await CouponDb.findByIdAndUpdate(
      { _id: couponId },
      { $set: { isDeleted: true } }
    );
    console.log(data);
    res.status(201).json({ message: "Coupon Deleted" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
}


export async function checkCoupon(req:Request, res:Response) {
  const { couponCode, productPrice } = req.body;
  console.log(req.body);

  try {
    const coupon = await CouponDb.findOne({ couponCode: couponCode });

    if (!coupon) {
      // Coupon not found
      return res.json({
        isValid: false,
        message: "Invalid coupon code. Please try again.",
      });
    }

    // Check if coupon is expired
    if (coupon.expiry.getTime() < Date.now()) {
      return res.json({ isValid: false, message: "Coupon has expired." });
  }  

    // Check if product price is within the price limit defined by the coupon
    if (productPrice > coupon.priceLimit) {
      return res.json({
        isValid: false,
        message: "Product price exceeds coupon limit.",
      });
    }

    // Check if max use count has been exceeded
    if (coupon.maxUse <= 0) {
      return res.json({
        isValid: false,
        message: "Coupon has reached its maximum usage limit.",
      });
    }

    // Update max use count and save coupon
    coupon.maxUse--;
    await coupon.save();

    // Calculate discount and send it back to the client
    const discount = coupon.coupondiscount;
    return res.json({ isValid: true, discount });
  } catch (error) {
    console.error("Error checking coupon:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
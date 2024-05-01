import { Request, Response } from "express";
import adminDb, { IAdmin } from "../../model/adminModel";
import bcrypt from "bcrypt";
import productDb from "../../model/productModel";
import userDb from "../../model/userModel";
import Orderdb from "../../model/orderModel";

interface body {
  email: string;
  password: string;
  id: string;
}
let loginError: string | null = null;

export async function getDashboard(req: Request, res: Response) {
  try {
    const productCount = await productDb.countDocuments({ isHidden: false });
    const userCount = await userDb.countDocuments({ liveStatus: true });
    const totalOrders = await Orderdb.aggregate([
      {
        $project: {
          orderDetailsCount: { $size: "$orderDetails" },
        },
      },
    ]);
    const totalOrderCount = totalOrders.reduce(
      (total, obj) => total + obj.orderDetailsCount,
      0
    );
    let orders = await Orderdb.aggregate([
      {
        $unwind: "$orderDetails",
      },
      {
        $lookup: {
          from: userDb.collection.name,
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $sort: {
          "orderDetails.orderDate": -1,
        },
      },
      {
        $match: {
          "orderDetails.orderStatus": "Delivered",
        },
      },
    ]);
    const totalPrice: any = orders.reduce(
      (total, order) => total + order.orderDetails.price,
      0
    );
    const bestSellingProducts = await Orderdb.aggregate([
      { $unwind: "$orderDetails" },
      {
        $group: {
          _id: "$orderDetails.pName",
          count: { $sum: "$orderDetails.quantity" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "productdbs",
          localField: "_id",
          foreignField: "name",
          as: "product"
        } 
      },
      { $unwind: "$product" },
    ]); 

  const bestSellingCategory = await Orderdb.aggregate([
    { $unwind: "$orderDetails" },
    {
      $lookup: {
        from: "productdbs",
        localField: "orderDetails.productId",
        foreignField: "_id",
        as: "product"
      } 
    },
    { $unwind: "$product" },
    {
      $lookup: {
        from: "categorydbs",
        localField: "product.category",
        foreignField: "_id",
        as: "category"
      } 
    },
    { $unwind: "$category" },
    {
      $group: {
        _id: "$category._id",
        categoryName: { $first: "$category.name" },
        count: { $sum: "$orderDetails.quantity" }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
    res.render("admin/dashboard", {
      productCount,
      userCount,
      totalOrderCount,
      totalPrice,
      bestSellingProducts,
      bestSellingCategory
    });
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
export async function getAdminlogout(req: Request, res: Response) {
  try {
    delete req.session.adminId;
    res.redirect("/adminlogin");
    loginError = null;
    return;
  } catch (error: any) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

const adminEmail = process.env.ADMIN_ID;
const adminPassword = process.env.ADMIN_PASS;

export async function isAdmin(req: Request<{}, {}, IAdmin>, res: Response) {
  try {
    const { email, password, role } = req.body;
    const admin = await adminDb.findOne({ email });
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

export async function getDetailsChart(
  req: Request,
  res: Response
): Promise<void> {
  try {
    let labelObj: Record<string, number> = {};
    let salesCount!: number[];
    let findQuerry: any;
    let currentYear!: number;
    let currentMonth!: number;
    let index!: number;

    switch (req.body.filter.toLowerCase()) {
      case "weekly":
        currentYear = new Date().getFullYear();
        currentMonth = new Date().getMonth() + 1;

        labelObj = {
          Sun: 0,
          Mon: 1,
          Tue: 2,
          Wed: 3,
          Thu: 4,
          Fri: 5,
          Sat: 6,
        };

        salesCount = new Array(7).fill(0);

        findQuerry = {
          "orderDetails.orderDate": {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lte: new Date(currentYear, currentMonth, 0, 23, 59, 59),
          },
        };
        index = 0;
        break;
      case "monthly":
        currentYear = new Date().getFullYear();
        labelObj = {
          Jan: 0,
          Feb: 1,
          Mar: 2,
          Apr: 3,
          May: 4,
          Jun: 5,
          Jul: 6,
          Aug: 7,
          Sep: 8,
          Oct: 9,
          Nov: 10,
          Dec: 11,
        };

        salesCount = new Array(12).fill(0);

        findQuerry = {
          "orderDetails.orderDate": {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31, 23, 59, 59),
          },
        };
        index = 1;
        break;
      case "daily":
        currentYear = new Date().getFullYear();
        currentMonth = new Date().getMonth() + 1;
        let end: Date | string | number = new Date(
          currentYear,
          currentMonth,
          0,
          23,
          59,
          59
        ) as Date;
        end = String(end).split(" ")[2] as string;
        end = Number(end) as number;

        for (let i = 0; i < end; i++) {
          labelObj[`${i + 1}`] = i;
        }

        salesCount = new Array(end).fill(0);

        findQuerry = {
          "orderDetails.orderDate": {
            $gt: new Date(currentYear, currentMonth - 1, 1),
            $lte: new Date(currentYear, currentMonth, 0, 23, 59, 59),
          },
        };

        index = 2;
        break;
      case "yearly":
        findQuerry = {};
        const ord = await Orderdb.aggregate([
          { $unwind: "$orderDetails" },
          { $sort: { "orderDetails.orderDate": 1 } },
        ]);

        const stDate: number = ord[0].orderDetails.orderDate.getFullYear();
        const endDate: number =
          ord[ord.length - 1].orderDetails.orderDate.getFullYear();
        for (let i = 0; i <= Number(endDate) - Number(stDate); i++) {
          labelObj[`${stDate + i}`] = i;
        }
        salesCount = new Array(Object.keys(labelObj).length).fill(0);
        index = 3;
        break;
      default:
        res.json({
          label: [],
          salesCount: [],
        });
        return;
    }
    const orders = await Orderdb.aggregate([
      {
        $unwind: {
          path: "$orderDetails",
        },
      },
      {
        $match: findQuerry,
      },
    ]);
    orders.forEach((order) => {
      if (index === 2) {
        salesCount[
          labelObj[
            Number(String(order.orderDetails.orderDate).split(" ")[index])
          ]
        ] += 1;
      } else {
        salesCount[
          labelObj[String(order.orderDetails.orderDate).split(" ")[index]]
        ] += 1;
      }
    });

    res.json({
      label: Object.keys(labelObj),
      salesCount,
    });
  } catch (error) {
    console.log(error);
  }
}

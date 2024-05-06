import { Request, Response } from "express";
import Orderdb from "../../model/orderModel";
import userDb from "../../model/userModel";
import puppeteer from "puppeteer-core";
import { Parser } from "json2csv";
import ejs from "ejs";
import path from "path";

export async function salesReport(req: Request, res: Response) {
  try {
    let startDate, endDate;
    const { filter, startDate: start, endDate: end } = req.query;

    if (filter === "daily") {
      startDate = new Date();
      endDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (filter === "weekly") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } else if (filter === "yearly") {
      startDate = new Date();
      startDate.setMonth(0);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setMonth(11);
      endDate.setDate(31);
      endDate.setHours(23, 59, 59, 999);
    } else if (filter === "custom") {
      if (start && end) {
        startDate = new Date(start as string);
        endDate = new Date(end as string);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = new Date();
        endDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      }
    } else {
      startDate = new Date(0);
      endDate = new Date();
    }

    const totalOrders = await Orderdb.aggregate([
      { $project: { orderDetailsCount: { $size: "$orderDetails" } } },
    ]);

    const totalOrderCount = totalOrders.reduce(
      (total, obj) => total + obj.orderDetailsCount,
      0
    );

    let orders = await Orderdb.aggregate([
      { $unwind: "$orderDetails" },
      {
        $lookup: {
          from: userDb.collection.name,
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      { $sort: { "orderDetails.orderDate": -1 } },
      {
        $match: {
          "orderDetails.orderStatus": "Delivered",
          "orderDetails.orderDate": { $gte: startDate, $lte: endDate },
        },
      },
    ]);
    const totalPrice = orders.reduce(
      (total, order) => total + order.orderDetails.price,
      0
    );

    res.render("admin/salesReport", { totalOrderCount, orders, totalPrice });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred while fetching sales report.");
  }
}

export async function salesReportExcel(req: Request, res: Response) {
  try {
    const fromDate: any = req.query.fromDate;
    const toDate: any = req.query.toDate;

    if (!toDate) {
      throw new Error("toDate parameter is empty or null");
    }

    const toDateObject = new Date(toDate[0]);

    if (isNaN(toDateObject.getTime())) {
      throw new Error("Invalid toDate");
    }

    toDateObject.setDate(toDateObject.getDate() + 1);
    const newToDate = toDateObject.toISOString().split("T")[0];

    let aggregateResult = await Orderdb.aggregate([
      { $unwind: "$orderDetails" },
      {
        $lookup: {
          from: userDb.collection.name,
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      { $sort: { "orderDetails.orderDate": -1 } },
      {
        $match: {
          "orderDetails.orderDate": {
            $gte: new Date(fromDate),
            $lte: new Date(newToDate),
          },
          "orderDetails.orderStatus": "Delivered",
        },
      },
    ]);

    const users: any = [];
    let count = 1;
    aggregateResult.forEach((orders) => {
      orders.sI = count;
      users.push({
        SI: orders.sI,
        "Orders ID": orders._id,
        "Product Name": orders.orderDetails.pName,
        "Product Quantity": orders.orderDetails.quantity,
        "User's Details": orders.orderDetails.address,
        "Order Date": orders.orderDetails.orderDate,
        "Payment Method": orders.orderDetails.paymentMethod,
        "Discount Price":
          orders.orderDetails.originalProductPrice - orders.orderDetails.price,
        "Total Amount": orders.orderDetails.price,
      });
      count++;
    });

    const csvFields: any = [
      "SI",
      "Orders ID",
      "Product Name",
      "Product Quantity",
      "User's Details",
      "Order Date",
      "Discount Price",
      "Total Amount",
    ];
    const csvParser = new Parser({ fields: csvFields });
    let csvData = csvParser.parse(users);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attatchment: filename=salesReport.csv"
    );
    res.send(csvData);
  } catch (error) {
    console.log(error);

    console.log("wsedrftgyhujik");
  }
}

export async function salesReportPDF(
  req: Request,
  res: Response
): Promise<void> {
  const fromDate = req.query.fromDate;
  const toDate = req.query.toDate;

  if (!fromDate || !toDate) {
    res.status(400).send("Please provide both fromDate and toDate parameters.");
    return;
  }

  const startDate = new Date(`${fromDate}T00:00:00`);
  const endDate = new Date(`${toDate}T23:59:59`);

  const templatePath = path.join(__dirname, "../../views/admin/salesPDF.ejs");

  const totalOrders = await Orderdb.aggregate([
    { $project: { orderDetailsCount: { $size: "$orderDetails" } } },
  ]);

  const totalOrderCount = totalOrders.reduce(
    (total, obj) => total + obj.orderDetailsCount,
    0
  );

  let orders = await Orderdb.aggregate([
    { $unwind: "$orderDetails" },
    {
      $lookup: {
        from: userDb.collection.name,
        localField: "userId",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    { $unwind: "$userDetails" },
    { $sort: { "orderDetails.orderDate": -1 } },
    {
      $match: {
        "orderDetails.orderStatus": "Delivered",
        "orderDetails.orderDate": {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
  ]);
  const totalPrice = orders.reduce(
    (total, order) => total + order.orderDetails.price,
    0
  );

  const currentDate = new Date().toDateString();
  const templateData = {
    fromDate,
    toDate,
    totalOrderCount,
    totalPrice,
    orders,
    currentDate,
  };

  const htmlTemplate = await ejs.renderFile(templatePath, templateData);
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/snap/bin/chromium",
  });
  const page = await browser.newPage();

  await page.setContent(htmlTemplate);
  const pdfBuffer = await page.pdf();
  await browser.close();

  res.setHeader("Content-Type", "application/pdf");
  res.send(pdfBuffer);
}

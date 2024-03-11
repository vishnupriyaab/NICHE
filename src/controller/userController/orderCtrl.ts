import { Request, Response } from "express";
import mongoose from "mongoose";
import Addressdb from "../../model/addressModel";
import CartDb from "../../model/cartModel";
import productDb from "../../model/productModel";
import { Session, SessionData } from "express-session";
import userDb from "../../model/userModel";
import orderDb from "../../model/orderModel";
import Orderdb from "../../model/orderModel";

// Extend the express-session's SessionData interface
// interface MySessionData extends SessionData {
//   addressId?: string; // Define addressId as an optional property
// }

export async function checkout(req: Request, res: Response) {
  try {
    const user = req.session.userId;
    const cart = await CartDb.findOne({ userId: user }).populate("products");
    const address = await Addressdb.find({ userId: user });

    const productid = await CartDb.findOne({
      userId: new mongoose.Types.ObjectId(user),
    });

    const products = await CartDb.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(user) },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: productDb.collection.name,
          localField: "products.productId",
          foreignField: "_id",
          as: "productsDetails",
        },
      },
      {
        $unwind: "$productsDetails",
      },
    ]);

    // console.log(products);

    const sum = products.reduce((total, product) => {
      // Ensure product and productDetails exist
      if (product.products && product.productsDetails) {
        total += product.products.quantity * product.productsDetails.price;
      }
      return total;
    }, 0);

    res.status(200).render("user/checkout", {
      address,
      sum,
      products,
      productid,
      user,
      cart,
    });
  } catch (error) {
    console.error("Error during checkout:", error);
    res.status(500).send("Error during checkout");
  }
}

export async function addAddress(req: Request, res: Response) {
  try {
    const user = req.session.userId;
    const cart = await CartDb.findOne({ userId: user }).populate("products");

    res.status(200).render("user/addaddress", { user, cart });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function showAddress(req: Request, res: Response) {
  try {
    let user = req.session.userId;
    const address = await Addressdb.find({ userId: user });
    const cart = await CartDb.findOne({ userId: user }).populate("products");

    res.status(200).render("user/showaddress", { address, user, cart });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function editAddress(req: Request, res: Response) {
  try {
    // Type casting req.session to MySessionData
    (req.session as SessionData).addressId = req.params.id;
    const address = await Addressdb.findOne({
      _id: (req.session as SessionData).addressId,
    });
    res.status(200).render("user/editAddress", { address });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function checkAddress(req: Request, res: Response): Promise<void> {
  try {
    // Fetch address data from the database
    const address = await Addressdb.findOne({ userId: req.session.userId });

    if (!address) {
      res.status(404).json({ message: "No address found" });
      return;
    }

    res.json(address);
  } catch (error) {
    console.error("Error fetching address:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function placeOrder(req: Request, res: Response) {
  try {
    const { paymentMethod, address, totalsum, name, price, quantity, image } =
      req.body;
    const sum = parseInt(totalsum);
    const totalprice = parseInt(price);
    const count = parseInt(quantity);

    const priceMatch = price.match(/₹(\d+)/);
    const quantityMatch = quantity.match(/(\d+)/);
    const sumMatch = totalsum.match(/(\d+)/);

    // Parse the matched values into numbers
    const pricee = priceMatch ? parseInt(priceMatch[1]) : 0;
    const quantityy = quantityMatch ? parseInt(quantityMatch[1]) : 0;
    const summ = sumMatch ? parseInt(sumMatch[1]) : 0;

    // Check if address and paymentMethod are provided
    if (!paymentMethod || !address || !totalsum) {
      throw new Error("Payment method, address, and total sum are required.");
    }

    let user = req.session.userId;

    const userId = await userDb.findById(user);
    const currentDate = new Date();
    const dateWithoutTime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    const cartItems = await CartDb.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(req.session.userId) },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: productDb.collection.name,
          localField: "products.productId",
          foreignField: "_id",
          as: "productsDetails",
        },
      },
      {
        $unwind: "$productsDetails",
      },
    ]);

    const orderItems = cartItems.map((element) => {
      const orderItem = {
        productId: element.products.productId,
        pName: element.productsDetails.name,
        price: element.productsDetails.price * quantityy,
        pImage: element.productsDetails.imgArr[0],
        quantity: quantityy,
        address: address,
        paymentMethod: paymentMethod,
        orderStatus: "Ordered",
        orderDate: dateWithoutTime,
      };
      return orderItem;
    });

    // Create a new order instance
    const newOrder = new orderDb({
      userId: userId,
      orderDetails: orderItems,
      totalsum: sum,
    });

    // Save the order to the database
    await newOrder.save();

    await clearUserCart(req.session.userId);
    res.status(200).json({ message: "Order placed successfully!" });
  } catch (error: any) {
    console.error("Error saving order:", error);
    res.status(400).json({ error: error.message });
  }
}

async function clearUserCart(userId: string | undefined) {
  try {
    // Find all cart items associated with the user
    const cartItems = await CartDb.findOne({ userId: userId });

    if (!cartItems) {
      console.log("User has no items in the cart");
      return; // Exit the function early if cartItems is null
    }

    // Loop through each cart item
    for (const cartItem of cartItems.products) {
      // Decrease the stock quantity of the product
      await decreaseProductStock(cartItem.productId, cartItem.quantity);

      // Delete the cart item
      await CartDb.findByIdAndDelete(cartItems._id);
    }

    console.log("User cart cleared successfully");
  } catch (error) {
    console.error("Error clearing user cart:", error);
    // Handle error appropriately
  }
}

async function decreaseProductStock(productId: any, quantity: number) {
  try {
    // Find the product by ID
    const product = await productDb.findOne({ _id: productId });
    // console.log(productId, "asdfg");

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    // Decrease the stock quantity
    product.stock -= quantity;

    // Save the updated product
    await product.save();

    // console.log(`Stock quantity decreased for product ${productId}`);
  } catch (error) {
    console.error("Error decreasing product stock:", error);
    // Handle error appropriately
  }
}

export async function cancelOrder(req: Request, res: Response) {
  const orderId = req.body.orderId;
  // console.log(orderId, "idd");

  try {
    // Find the order by ID
    const order = await orderDb.findOneAndUpdate(
      { "orderDetails._id": orderId },
      { $set: { "orderDetails.$.orderStatus": "Cancelled" } },
      { projection: { "orderDetails.$": 1 } }
    );

    // Add the quantity back to product stock
    if (order) {
      const product = await productDb.findOneAndUpdate(
        { _id: order.orderDetails[0].productId },
        { $inc: { quantity: order.orderDetails[0].quantity } }
      );
    }

    res.status(200).send("Order cancelled successfully");
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).send("Error cancelling order");
  }
}

export async function successPage(req: Request, res: Response) {
  try {
    const userid = req.session.userId;
    const user = await userDb.findById(userid);
    const cart = await CartDb.findOne({ userId: user }).populate("products");
    res.status(200).render("user/successpage", { user, cart });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function orderslist(req: Request, res: Response) {
  try {
    const cartItems = await CartDb.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(req.session.userId) },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: productDb.collection.name,
          localField: "products.productId",
          foreignField: "_id",
          as: "productsDetails",
        },
      },
      {
        $unwind: "$productsDetails",
      },
    ]);

    const userid = req.session.userId;

    const user = await userDb.findOne({ _id: req.session.userId });
    const cart = await CartDb.findOne({ userId: user }).populate("products");

    const orders = await Orderdb.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userid) },
      },
      { $unwind: "$orderDetails" },
      { $sort: { "orderDetails.orderDate": -1 } },
    ]);
    // console.log(orders);
    res.render("user/ordersList", { orders, user, cart });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function orderInfo(req: Request, res: Response) {
  try {
    const user = await userDb.findOne({ _id: req.session.userId });
    const cart = await CartDb.findOne({ userId: user }).populate("products");
    const proid = req.params.id;
    const details = await Orderdb.findOne(
      { "orderDetails._id": new mongoose.Types.ObjectId(proid) },
      { "orderDetails.$": 1, _id: 1, userId: 1 }
    );
    res.render("user/orderInfo", { details, user, cart });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}


export async function returnOrder(req: Request, res: Response) {
  const orderId = req.body.orderId;
  try {
    const order = await Orderdb.findOneAndUpdate(
      { "orderDetails._id": orderId },
      { $set: { "orderDetails.$.orderStatus": "Returned" } },
      { projection: { "orderDetails.$": 1 } }
    );

    // Check if order is null
    if (!order) {
      throw new Error("Order not found");
    }

    const product = await productDb.findOneAndUpdate(
      { _id: order.orderDetails[0].productId },
      { $inc: { quantity: order.orderDetails[0].quantity } }
    );

    if (order.orderDetails[0].orderStatus == "Delivered") {
      const user = await userDb.findOne({ _id: req.session.userId });
      if (!user) {
        throw new Error("User not found");
      }

      const refundorder = await Orderdb.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.session.userId),
          },
        },
        {
          $unwind: "$orderDetails",
        },
      ]);

      const amount =
        Number(refundorder[0].orderDetails.price) *
        Number(refundorder[0].orderDetails.quantity);
    }
    res.status(200).send("Order returned successfully");
  } catch (error) {
    // If there's an error, send an error response
    console.error("Error returning order:", error);
    res.status(500).send("Error returning order");
  }
}

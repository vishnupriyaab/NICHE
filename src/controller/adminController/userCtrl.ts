import { Request, Response } from "express";
import userDb from "../../model/userModel";
import { getAllUsers } from "../../config/dbHelper";

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await userDb.find();
    const page = req.query.page
      ? parseInt(req.query.page as string)
      : undefined; // Parse page as a number
    const user = await getAllUsers(page);
    const totalUsers = users.length;
    res.render("admin/users", {
      user,
      currentPage: Number(req.query.page),
      totalUsers,
    });
  } catch (error: any) {
    res.status(500).send("Internal Server Error");
  }
}

export async function blockuser(req: Request, res: Response) {
  try {
    const data = await userDb.updateOne(
      { _id: req.query.userid },
      { $set: { block: true } }
    );
    res.status(200).redirect("/users");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

export async function unblockuser(req: Request, res: Response) {
  try {
    const data = await userDb.updateOne(
      { _id: req.query.userid },
      { $set: { block: false } }
    );
    res.status(200).redirect("/users");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const connetDb_1 = __importDefault(require("./config/connetDb"));
const userRouter_1 = __importDefault(require("./router/userRouter"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
//view engine setup
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "views"));
app.use(express_1.default.static(__dirname + "/assets"));
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).send("Internal Server Error");
});
//Routs
app.use("/", userRouter_1.default);
(0, connetDb_1.default)(); //connecting to database
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3030;
app.listen(port, () => {
    console.log("server listening..", port);
});

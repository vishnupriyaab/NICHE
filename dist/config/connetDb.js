"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const url = process.env.DATABASE_URL || "mongodb://localhost:27017/NIHCE_Backup";
function connectionDB() {
    mongoose_1.default.set('strictQuery', true);
    mongoose_1.default
        .connect(url)
        .then(() => console.log("database connected", url))
        .catch((error) => console.error(error));
}
exports.default = connectionDB;

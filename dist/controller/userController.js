"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSignup = exports.getLogin = void 0;
function getLogin(req, res) {
    try {
        res.render("user/userLogin");
    }
    catch (error) {
        console.error(error);
    }
}
exports.getLogin = getLogin;
//UserSignup
function userSignup(req, res) {
    try {
        console.log("hi");
    }
    catch (error) {
        console.log(error);
    }
}
exports.userSignup = userSignup;

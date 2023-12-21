// // const http = require("http");
// import http from "http";
// import { generatePercentage } from "./features.js";
// import fs from "fs";

// const home = fs.readFileSync("./index.html");
// // console.log(home)

// // console.log(generatePercentage());

// const server = http.createServer((req, res) => {
//     if (req.url === "/") {
//         res.end(home)
//     } else if (req.url === "/about") {
//         res.end("<h1>This is about page</h1>")
//     } else if (req.url === "/student") {
//         res.end(`<h1>student Percentage ${generatePercentage()}</h1>`)
//     } else {
//         res.statusCode = 404;
//         res.end("<h1>page not found</h1>")
//     }
// });

// server.listen(5000, () => {
//     console.log("server is running")
// })





import express from "express";
import path from "path";
import mongoose, { Schema } from "mongoose";
import cookieParser from "cookie-parser";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";


mongoose.connect("mongodb://localhost:27017", {
    dbName: "backend",
}).then(() => { console.log("Database Connected") }).catch((err) => { console.log(err) })

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
})

const User = mongoose.model("User", userSchema);


const app = express();




// using Middlewares 
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.set("view engine", "ejs");

const isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies;

    if (token) {

        const decodeddata = jsonwebtoken.verify(token, "skdlfjaddddsssasskdjl");
        req.user = await User.findById(decodeddata._id);

        next()
    } else {
        res.redirect("/login")
    }
}

app.get("/", isAuthenticated, (req, res) => {
    // console.log(req.user);
    res.render("logout", { name: req.user.name })
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/register", (req, res) => {
    // console.log(req.user);
    res.render("register")
})

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) return res.redirect("/register");

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.render("login", { email, massage: "Incorrect Password" });

    const token = jsonwebtoken.sign({ _id: user._id }, "skdlfjaddddsssasskdjl");
    console.log(token)

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 6 * 1000)
    });
    res.redirect("/")

})

app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
        return res.redirect("/login");
    }

    const hashedpassword = await bcrypt.hash(password, 10);

    user = await User.create({
        name,
        email,
        password: hashedpassword,
    });

    const token = jsonwebtoken.sign({ _id: user._id }, "skdlfjaddddsssasskdjl");
    console.log(token)

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 6 * 1000)
    });
    res.redirect("/")
})

app.get("/logout", (req, res) => {
    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now())
    });
    res.redirect("/")
})

// app.get("/add", async (req, res) => {
//     await message.create({ name: "Jayant2", email: "sample2@gmail.com" })
//     res.send("Nice");
// })

// app.get("/success", (req, res) => {
//     res.render("success")
// })

// app.post("/contact", async (req, res) => {
//     const { name, email } = req.body;
//     await message.create({ name, email })
//     res.redirect("/success")
// })

// app.get("/user", (req, res) => {
//     res.json({ user })
// })


app.listen(5000, () => {
    console.log("app is working");
})

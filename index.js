// const http = require("http")
// const fs = require("fs")
// const server = http.createServer((req, res) => {
//     // console.log(req.url);
//     if (req.url === "/about") {
//         res.end("About")
//     }
//     else if (req.url === "/contact") {
//         res.end("Contact")
//     }
//     else if (req.url === "/") {
//         fs.readFile("./home.html", (err ,home) => {
//             res.end(home)
//         })
//     }
//     else {
//         res.end("Error  ")
//     }
// })

// server.listen(5000, () => {

//     console.log("Server is runninggg");
// })
import jwt from 'jsonwebtoken'
import express from 'express'
import bcrypt from 'bcrypt'
import path from 'path'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
mongoose.connect("mongodb://localhost:27017", {
    dbName: "backend"
}).then(() => console.log("Database is connected")).catch((err) => console.log(err))

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const User = mongoose.model("User", userSchema)

const app = express()
// setting up View engine 
app.set("view engine", "ejs")
const users = []
// USING MIDDLEWARES

// app.use (express.static(path.join(path.resolve(),"public")))
//  console.log(path.join(path.resolve(),"public"));
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

const isAuth = async (req, res, next) => {
    const { token } = req.cookies
    if (token) {
        const decoded = jwt.verify(token, "ldkfjlkdsjfl")
        req.user = await User.findById(decoded._id)
        next()
    } else {
        res.redirect("login")
    }

}
app.get("/", isAuth, (req, res) => {
    // res.send("hi")
    // res.sendStatus(404)
    // res.json({
    //     success:true,
    //     product:[ ]
    // })

    // const pathlocation = path.resolve()
    // res.sendFile(path.join(pathlocation,"./home.html"))

    console.log(req.user);
    res.render("logout", { name: req.user.name })


})
// app.get("/add", async (req, res) => {
//     await Message.create({ name: "prince", email: "prince@gmail.com" })
//     res.send("Nice")
// })

app.get("/register", (req, res) => {
    res.render("register")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.post("/login", async(req,res)=>{
    const {  email, password } = req.body
    let user = await User.findOne({email})
    if(!user) return res.redirect("register")

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) return res.render("login", {email,message:"Wrong password"})
 
    const token = jwt.sign({ _id: user._id }, "ldkfjlkdsjfl")
    res.cookie("token", token, {
        httpOnly: true, expires: new Date(Date.now() + 20000)
    })
    res.redirect("/") 

})
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body

    let user = await User.findOne({ email })
    if (user) {
        return res.redirect("login")
    }
    const hashedPass = await bcrypt.hash(password,10)

    user = await User.create({ name, email, password:hashedPass })



    const token = jwt.sign({ _id: user._id }, "ldkfjlkdsjfl")
    console.log(token);
    res.cookie("token", token, {
        httpOnly: true, expires: new Date(Date.now() + 20000)
    })
    res.redirect("/")
})


app.get("/logout", (req, res) => {
    res.cookie("token", null, {
        httpOnly: true, expires: new Date(Date.now())
    })
    res.redirect("/")
})

// app.post("/contact", async (req, res) => {
//     const messageData = ({ name: req.body.name, email: req.body.email })
//     await Message.create(messageData)
//     res.render("success")
// })

// app.get("/users", (req, res) => {
//     res.json({
//         users
//     })
// })

app.listen(5000, () => {
    console.log("Server is running");
})  
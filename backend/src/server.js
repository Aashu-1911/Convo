import express from "express"
import "dotenv/config" ;
import cookieparser from "cookie-parser";
import cors from  "cors";

import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import chatRoutes from './routes/chat.route.js';

import {connectDB} from './db/db.js';
import { protectRoute } from "./middleware/auth.middleware.js";


const app = express();
const PORT = process.env.PORT

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,//allow cookies to be sent
}))

// app.get("/api/auth/signup", (req, res) => {
//     res.send("Signup route!")
// })

// app.get("/api/auth/login", (req, res) => {
//     res.send("Login route!")
// })

// app.get("/api/auth/logout", (req, res) => {
//     res.send("Logout route!")
// })
app.use(express.json());
app.use(cookieparser());
app.use("/api/auth", authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/chat",chatRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    connectDB()
})
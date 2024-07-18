import express, { Request, Response, NextFunction } from 'express'
import { MONGO_URI, PORT } from './config'
import authRouter from "./routes/auth"
import mongoose from 'mongoose';
import errorHandler from './middlewares/errorHandler'
import notFoundHandler from './middlewares/errorHandler'
import { authMiddleware, AuthRequest } from './middlewares/authMiddleware';
import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import cors from 'cors';
const app = express();
app.use(cors());
app.use(cookieParser())
app.use(bodyParser.json());


app.get("/", authMiddleware, (req: AuthRequest, res: Response) => {
    res.status(200).send("hello")
})

app.use("/auth", authRouter);

//For catching 404 Error
app.use(notFoundHandler);

//Handling every error
app.use(errorHandler);


app.listen(PORT, async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log(`The server is running on port ${PORT}`)
    } catch (err) {
        console.log(err)
    }
})
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
import airdropRouter from './routes/airdrop';
import nftSwapRouter from './routes/nftSwap';
import { Server as SocketIOServer } from "socket.io"
import http from 'http'
import snapshotRouter from './routes/snapshot';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: "*", // or your specific origin
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
})


app.use(cors());
app.use(cookieParser())
app.use(bodyParser.json());



app.get("/", authMiddleware, (req: AuthRequest, res: Response) => {
    res.status(200).send("hello")
})

app.use("/auth", authRouter);
app.use("/airdrop", authMiddleware, airdropRouter);
app.use("/nft-swap", authMiddleware, nftSwapRouter);
app.use("/snapshot", authMiddleware, snapshotRouter);

//For catching 404 Error
app.use(notFoundHandler);

//Handling every error
app.use(errorHandler);


server.listen(PORT, async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log(`The server is running on port ${PORT}`)
    } catch (err) {
        console.log(err)
    }
})

io.on('connection', (socket) => {

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    // Handle updateProposal event
    socket.on('updateProposal', () => {
        // Emit the updateProposal event to all clients, including the sender
        io.emit("updateProposal");
    });

    socket.on('swap', () => {
        // Emit the updateProposal event to all clients, including the sender
        io.emit("swap");
    });

    socket.on('updateConfirm', () => {
        console.log("updateConfirm");
        // Emit the updateProposal event to all clients, including the sender
        io.emit("updateConfirm",);
    });
});
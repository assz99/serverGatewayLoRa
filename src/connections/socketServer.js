import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
export const socketServer = new Server(httpServer, { /* options */ });
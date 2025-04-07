import express from 'express';
import { createServer } from 'http';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import { connectDatabase } from './config/database';
import errorMiddleware from './middlewares/globalError';
import userRouter from './routes/userRoutes';

dotenv.config();

const app = express();
const server = createServer(app);
const port = process.env.PORT || 5000;

app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ["GET","POST","PUT","PATCH","DELETE"],
    credentials: true
}));

app.use(morgan('dev'));

//Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || '',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 15,
        secure: process.env.NODE_ENV === 'production'
    }
}));

app.use('/api/user', userRouter);
app.use(errorMiddleware);

connectDatabase();
server.listen( port, ()=> {
    console.log(`Server running`);
});
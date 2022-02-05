import express from 'express';
import cors from 'cors';
import authRouter from './Routes/Auth';
import usersRouter from './Routes/Users';

export const twitterEndpoint = "https://api.twitter.com/2";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/2/oauth2", authRouter);
app.use("/2/users", usersRouter)


app.listen(3001, () => console.log("Server up on 3001"));
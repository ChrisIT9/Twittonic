import express from 'express';
import cors from 'cors';
import authRouter from './Routes/Auth';
import timelineRouter from './Routes/Timeline';

export const twitterEndpoint = "https://api.twitter.com/2";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(`/2/oauth2`, authRouter);
app.use('/2/timeline', timelineRouter)


app.listen(3001, () => console.log("Server up on 3001"));
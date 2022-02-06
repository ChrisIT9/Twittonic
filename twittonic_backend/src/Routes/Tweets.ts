import express from 'express';
import axios from 'axios';
import { twitterEndpoint } from '../app';
import { checkAuthHeaders } from '../middlewares/auth';

const tweetsRouter = express.Router();

tweetsRouter.post("/", checkAuthHeaders, async ({ headers: { authorization: Authorization }, body }, res) => {
    try {
        const { data } = await axios.post(`${twitterEndpoint}/tweets`, JSON.stringify(body), {
            headers: { Authorization: Authorization!, "Content-Type": "application/json" },
        });

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json(error);
    }
})

export default tweetsRouter;

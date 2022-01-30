import express from 'express';
import axios from 'axios';
import { twitterEndpoint } from '../app';
import { stringifyBody } from '../Utils/stringifyBody';

const authRouter = express.Router();

authRouter.post('/token', async ({ body, headers: { authorization, "content-type": contentType } }, res) => {
    if (!authorization || !contentType)
        return res.status(400).json({ message: "Invalid headers." });
    
    const stringifiedBody = stringifyBody(body);

    try {
        const response = await axios.post(`${twitterEndpoint}/oauth2/token`, stringifiedBody, {
            headers: {
                "Content-Type": contentType,
                "Authorization": authorization
            }
        });
    
        return res.status(200).json(response.data);
    } catch(error) {
        return res.status(500).json({ message: "Something went wrong.", response: error });
    }
    
})

export default authRouter;
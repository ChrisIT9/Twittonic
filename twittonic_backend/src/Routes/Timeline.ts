import express from 'express';
import axios from 'axios';
import { twitterEndpoint } from '../app';
import { stringifyBody } from '../Utils/stringifyBody';
import { Followings, UserResponse } from '../Typings/TwitterApi';

const timelineRouter = express.Router();

timelineRouter.get('', async ({ headers: { authtoken: authToken } }, res) => {
    if (!authToken)
        return res.status(400).json({ message: "Token is missing!" });

    const authTokenHeader = { "Authorization": `Bearer ${authToken}` };

    try {
        const { data: { data: { id } } } = await axios.get<UserResponse>(`${twitterEndpoint}/users/me`, {
            headers: authTokenHeader
        });

        const { data: { data } } = await axios.get<Followings>(`${twitterEndpoint}/users/${id}/following`, {
            headers: authTokenHeader
        })

        console.log(data);
    } catch(error) {
        console.log(error);
    } 

})

export default timelineRouter;
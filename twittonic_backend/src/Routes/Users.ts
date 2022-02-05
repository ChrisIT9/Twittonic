import express from 'express';
import axios from 'axios';
import { twitterEndpoint } from '../app';
import { stringifyBody } from '../Utils/stringifyBody';
import { Followings, UserResponse } from '../Typings/TwitterApi';

const usersRouter = express.Router();

usersRouter.get('/me', async ({ headers: { authorization: Authorization }, query: { "user.fields": userFields } }, res) => {
    if (!Authorization)
        return res.status(400).json({ message: "Token is missing!" });

    try {
        const { data: { data: userData } } = await axios.get<UserResponse>(`${twitterEndpoint}/users/me?user.fields=${userFields}`, {
            headers: { Authorization }
        });

        return res.status(200).json({ data: userData });
    } catch(error) {
        return res.status(400).json(error);
    } 

})

usersRouter.get(
    '/:id/following', 
    async ({ headers: { authorization: Authorization }, params: { id }, query: { "user.fields": userFields } }, res) => {
        if (!Authorization)
            return res.status(400).json({ message: "Token is missing!" });

        try {
            
        } catch(error) {

        }
    }
)

export default usersRouter;
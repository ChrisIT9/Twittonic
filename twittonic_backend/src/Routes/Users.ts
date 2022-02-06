import express from 'express';
import axios from 'axios';
import { twitterEndpoint } from '../app';
import { Followings, UserResponse } from '../Typings/TwitterApi';
import { checkAuthHeaders } from '../middlewares/auth';

const usersRouter = express.Router();

usersRouter.get('/me', checkAuthHeaders, async ({ headers: { authorization: Authorization }, query: { "user.fields": userFields } }, res) => {
    try {
        const { data: { data: userData } } = await axios.get<UserResponse>(`${twitterEndpoint}/users/me?user.fields=${userFields}`, {
            headers: { Authorization: Authorization! }
        });

        return res.status(200).json({ data: userData });
    } catch(error) {
        return res.status(400).json(error);
    } 

})

usersRouter.get(
    '/:id/following', 
    checkAuthHeaders,
    async ({ headers: { authorization: Authorization }, params: { id }, query: { "user.fields": userFields } }, res) => {
        try {
            
        } catch(error) {

        }
    }
)

usersRouter.get(
    "/:id/tweets", 
    checkAuthHeaders, 
    async ({ headers: { authorization: Authorization }, 
        params: { id }, 
        query: { "tweet.fields": tweetFields, expansions, "media.fields": mediaFields, "user.fields": userFields, "max_results": maxResults } }, 
        res) => {
            try {
                const { data } = await axios.get(`${twitterEndpoint}/users/${id}/tweets?tweet.fields=${tweetFields}&expansions=${expansions}&media.fields=${mediaFields}&user.fields=${userFields}&max_results=${maxResults}`, {
                    headers: { Authorization: Authorization! }
                })
                return res.status(200).json(data);
            } catch (error) {
                return res.status(500).json(error);
            }
        }   
)

export default usersRouter;
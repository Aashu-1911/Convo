import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: "http://localhost:6001/api",
    withCredentials: true,
})
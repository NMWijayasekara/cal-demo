import axios, { AxiosRequestConfig } from 'axios';

const axiosConfig: AxiosRequestConfig = {
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
};

const apiInstance = axios.create(axiosConfig);


export default apiInstance;
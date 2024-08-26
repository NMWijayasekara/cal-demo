import axios, { AxiosRequestConfig } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL;
if (!baseURL) {
    console.error('API URL is not set');
}

const normalizedBaseURL = baseURL?.replace(/\/+$/, '') || '';

const axiosConfig: AxiosRequestConfig = {
    baseURL: `${normalizedBaseURL}`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
};

const apiInstance = axios.create(axiosConfig);


export default apiInstance;
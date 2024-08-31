import axios from "axios";

const CAL_API_KEY = process.env.NEXT_PUBLIC_CAL_API_KEY;

export const getEvents = async () => {
    const response = await axios.get(`https://api.cal.com/v1/event-types?apiKey=${CAL_API_KEY}`);
    return response.data.event_types;
}

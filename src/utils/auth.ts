import CryptoJS from 'crypto-js';
import moment from 'moment';

export const getAuthHeaders = (verb: string, route: string, body?: object) => {
    const apiKey = import.meta.env.VITE_API_KEY;
    const apiSecret = import.meta.env.VITE_API_SECRET;

    if (!apiKey || !apiSecret) {
        console.error('Credenciales no encontradas');
        return null;
    }

    const date = moment().utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
    const jsonBody = body ? JSON.stringify(body) : "";
    const hmacData = `${verb}${route}${date}${jsonBody}`;
    const hmacSignature = CryptoJS.HmacSHA256(hmacData, apiSecret).toString(CryptoJS.enc.Hex);
    const authorizationHeader = `${apiKey}:${hmacSignature}`;

    return {
        'X-Date': date,
        'Authorization': authorizationHeader,
        'Content-Type': 'application/json'
    };
};

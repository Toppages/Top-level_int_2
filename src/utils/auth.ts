import CryptoJS from 'crypto-js';
import moment from 'moment';

export const getAuthHeaders = (verb: string, route: string) => {
    const apiKey = localStorage.getItem('apiKey');
    const apiSecret = localStorage.getItem('apiSecret');

    if (!apiKey || !apiSecret) {
        console.error('Credenciales no encontradas');
        return null;
    }

    const date = moment().utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
    const hmacData = verb + route + date;
    const hmacSignature = CryptoJS.HmacSHA256(hmacData, apiSecret).toString(CryptoJS.enc.Hex);
    const authorizationHeader = `${apiKey}:${hmacSignature}`;

    return {
        'X-Date': date,
        'Authorization': authorizationHeader,
        'Content-Type': 'application/json'
    };
};

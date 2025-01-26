import CryptoJS from "crypto-js";

const secretKey = "0a974821b5a09001cd08563f8a586067fe21248115d726a42910ca097fbb35ca";

import axios from "axios";
const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function generateIV() {
    return CryptoJS.lib.WordArray.random(16);
}

export function saveData(data_key, data, expirationInMinutes) {
    const expiration = new Date().getTime() + expirationInMinutes * 60 * 1000;
    let loginData = typeof data === 'string' ? JSON.parse(data) : data;
    loginData.expiry = expiration;

    const iv = generateIV();
    const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(loginData), 
        secretKey, 
        { iv: iv }
    ).toString();

    const dataToStore = {
        iv: iv.toString(CryptoJS.enc.Base64),
        encryptedData: encryptedData,
    };
    localStorage.setItem(data_key, JSON.stringify(dataToStore));
}

export function getData(data_key) {
    const storedData = localStorage.getItem(data_key);
    if (!storedData) {
        return null;
    }

    try {
        const { iv, encryptedData } = JSON.parse(storedData);
        const ivWordArray = CryptoJS.enc.Base64.parse(iv);
        const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey, { iv: ivWordArray });
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedData) {
            console.error("Failed to decrypt data.");
            return null;
        }

        const data = JSON.parse(decryptedData);
        const now = new Date().getTime();

        if (now > data.expiry) {
            if (data_key === 'login_data') {
                const csrftoken = getCookie('csrftoken');
                axios.post('/api/logout/', decryptedData, {
                    headers: {
                        'X-CSRFTOKEN': csrftoken,
                        "Content-Type": "multipart/form-data",
                    },
                })
            } 
            localStorage.removeItem(data_key);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Error decrypting data:", error);
        return null;
    }
}
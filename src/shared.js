const axios = require('axios');

const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL;

const sharedDataService = {
    async saveAuth(authData) {
        await axios.post(`${PROXY_URL}/api/shared/auth`, authData);
    },

    async saveCart(cartData) {
        await axios.post(`${PROXY_URL}/api/shared/cart`, cartData);
    },

    async getSharedData() {
        const { data } = await axios.get(`${PROXY_URL}/api/shared/data`);
        return data;
    }
};

module.exports = sharedDataService;
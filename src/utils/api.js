const fetchEthPrice = async (attempts = 0) => {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        if (data.ethereum?.usd) {
            return data.ethereum.usd;
        }
        throw new Error('Invalid price data');
    } catch (error) {
        if (attempts < 3) {
            setTimeout(() => fetchEthPrice(attempts + 1), 1000);
        } else {
            return 3195; // Fallback price
        }
    }
};

const fetchLidoAPR = async () => {
    try {
        const response = await fetch('https://eth-api.lido.fi/v1/protocol/eth/apr/last');
        const data = await response.json();
        return data.data.apr;
    } catch (error) {
        return 0.03; // Fallback APR
    }
};

const fetchVanillaStakingAPR = async () => {
    try {
        const response = await fetch('https://beaconcha.in/api/v1/epoch/latest');
        const data = await response.json();
        const vanillaAPR = (data.data.averagevalidatorbalance - 32000000000) / 32000000000 * 365 / 28 * 100;
        return Number(vanillaAPR.toFixed(1));  // Formats to one decimal place
    } catch (error) {
        return 3.0;
    }
};

const fetchCSM = async () => {
    try {
        const response = await fetch('https://keys-api.lido.fi/v1/modules/3/operators');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};




export { fetchEthPrice, fetchLidoAPR, fetchVanillaStakingAPR, fetchCSM };

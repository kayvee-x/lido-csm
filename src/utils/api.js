const fetchEthPrice = async (attempts = 0) => {
    const backoffTime = Math.pow(2, attempts) * 1000; 

    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', {
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });

        if (response.status === 429) {
            if (attempts < 3) {
                await new Promise(resolve => setTimeout(resolve, backoffTime));
                return fetchEthPrice(attempts + 1);
            }
            return 3930;
        }

        const data = await response.json();
        return data.ethereum?.usd || 3195;
    } catch (error) {
        console.error(`Attempt ${attempts + 1} failed:`, error);

        if (attempts < 3) {
            await new Promise(resolve => setTimeout(resolve, backoffTime));
            return fetchEthPrice(attempts + 1);
        }
        return 3930;
    }
};


const fetchLidoAPR = async () => {
    try {
        const response = await fetch('https://eth-api.lido.fi/v1/protocol/steth/apr/sma');
        const data = await response.json();
        const LidoAPR = data.data.smaApr;
        return Number(LidoAPR.toFixed(2));  
    } catch (error) {
        return 0.03; // Fallback APR
    }
};

const fetchVanillaStakingAPR = async () => {
    try {
        const response = await fetch('https://beaconcha.in/api/v1/epoch/latest');
        const data = await response.json();
        const vanillaAPR = (data.data.averagevalidatorbalance - 32000000000) / 32000000000 * 365 / 28 * 100;
        return Number(vanillaAPR.toFixed(2)); 
    } catch (error) {
        return 3.0;
    }
};




export { fetchEthPrice, fetchLidoAPR, fetchVanillaStakingAPR };

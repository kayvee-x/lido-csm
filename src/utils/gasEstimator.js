const EITHERSCAN = process.env.REACT_APP_ETHERSCAN;

export async function getGasEstimates() {
    const response = await fetch(
        `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${EITHERSCAN}`
    );
    const data = await response.json();
    return data.result;
}

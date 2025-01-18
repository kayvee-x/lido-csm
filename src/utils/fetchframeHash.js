import { JsonRpcProvider, Contract } from 'ethers';

const ABI = [
    "event ReportSubmitted(tuple(string treeCid, string logCid, uint256 timestamp) data, uint256 contractVersion)"
];

const CONTRACT_ADDRESS = process.env.REACT_APP_CSACCOUNTING_CONTRACT_ADDRESS;
const BLOCKS_PER_QUERY = 1000; // Etherscan block limit

export async function fetchLatestFrames() {
    const provider = new JsonRpcProvider(process.env.REACT_APP_RPC_URL);
    const contract = new Contract(CONTRACT_ADDRESS, ABI, provider);

    const latestBlock = await provider.getBlockNumber();
    let events = [];

    // Fetch events in 1000 block chunks
    for (let fromBlock = latestBlock - 10000; fromBlock < latestBlock; fromBlock += BLOCKS_PER_QUERY) {
        const toBlock = Math.min(fromBlock + BLOCKS_PER_QUERY - 1, latestBlock);
        const chunk = await contract.queryFilter('ReportSubmitted', fromBlock, toBlock);
        events = [...events, ...chunk];
    }

    const sortedEvents = events.sort((a, b) => b.args.data.timestamp - a.args.data.timestamp);

    return sortedEvents.map((event, index) => {
        const timestamp = new Date(Number(event.args.data.timestamp) * 1000);
        const nextTimestamp = new Date(timestamp);
        nextTimestamp.setDate(timestamp.getDate() + 28);

        const period = index === 0
            ? `Current Frame (${timestamp.toLocaleDateString()} - ${nextTimestamp.toLocaleDateString()})`
            : `Frame ${sortedEvents.length - index} (${timestamp.toLocaleDateString()} - ${nextTimestamp.toLocaleDateString()})`;

        return {
            period,
            logCid: event.args.data.logCid
        };
    });
}


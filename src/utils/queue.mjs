import { ethers } from 'ethers';
import readline from 'readline/promises';
import chalk from 'chalk';

// // Load environment variables
// dotenv.config();

const CSM_ADDRESS = process.env.REACT_APP_CSMODULE_CONTRACT_ADDRESS || '0xdA7dE2ECdDfccC6c3AF10108Db212ACBBf9EA83F';
const CSM_ABI = [
    "function depositQueue() view returns (uint128 head, uint128 tail)",
    "function depositQueueItem(uint128 index) view returns (uint256)"
];

// Test values (fallback if .env not set)
const testValues = {
    RPC_URL: 'https://rpc.mevblocker.io/',
    TARGET_NO_ID: '20' // Test with this NO ID if none provided
};

function parseQueueItem(item) {
    const hex = item.toString(16).padStart(64, '0');
    return {
        noId: BigInt('0x' + hex.substring(0, 16)),
        keysCount: BigInt('0x' + hex.substring(16, 32)),
        nextItem: BigInt('0x' + hex.substring(32))
    };
}

async function getQueueData(targetNoId) {
    const rpc = process.env.REACT_APP_RPC_URL || testValues.RPC_URL;
    const provider = new ethers.JsonRpcProvider(rpc);
    const contract = new ethers.Contract(CSM_ADDRESS, CSM_ABI, provider);

    const [head] = await contract.depositQueue();
    let nextItem = head;
    let position = 1;
    let keysInFront = 0n;
    let queueEntries = [];
    let found = false;

    while (nextItem !== 0n) {
        const item = await contract.depositQueueItem(nextItem);
        const { noId, keysCount, nextItem: newNext } = parseQueueItem(item);

        const isTarget = noId === BigInt(targetNoId);

        queueEntries.push({
            position,
            noId: noId.toString(),
            keysCount: keysCount.toString(),
            isTarget
        });

        if (!isTarget) {
            keysInFront += keysCount;
        } else {
            found = true;
        }

        position++;
        nextItem = newNext;
    }

    return {
        entries: queueEntries,
        summary: {
            totalBatches: position - 1,
            totalKeys: keysInFront.toString(),
            found,
            keysInFront: keysInFront.toString()
        }
    };
}

// Terminal interface
async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    try {
        const input = await rl.question(chalk.yellow('Enter NO ID (or press enter to use test value): '));
        const targetNoId = input || testValues.TARGET_NO_ID;

        console.log(chalk.blue('\nFetching queue data...'));
        const { entries, summary } = await getQueueData(targetNoId);

        console.log('\n' + chalk.green.bold('Queue Results:'));
        console.table(entries.map(entry => ({
            Position: entry.position,
            'NO ID': entry.noId,
            Keys: entry.keysCount,
            Status: entry.isTarget ? chalk.green('✅ Your Batch') : chalk.gray('⏳ Pending')
        })));

        console.log(chalk.blue.bold('\nSummary:'));
        console.log(chalk`{white Total Batches:} {yellow ${summary.totalBatches}}`);
        console.log(chalk`{white Total Keys:} {yellow ${summary.totalKeys}}`);
        console.log(chalk`{white Your Batch Found:} ${summary.found ? chalk.green('Yes') : chalk.red('No')}`);

        if (summary.found) {
            console.log(chalk`{white Keys Before You:} {yellow ${summary.keysInFront}}`);
        }

    } catch (error) {
        console.error(chalk.red('\nError:', error.message));
    } finally {
        rl.close();
    }
}

main();
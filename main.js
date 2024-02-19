const { Connection, PublicKey } = require('@solana/web3.js');
const cliProgress = require('cli-progress');
const fs = require('fs');
const config = require('./config.json');

const botAddresses = config.address;

// Function to fetch all transactions for a given public key within a specified time range.
async function fetchAllTransactions(connection, publicKey, startTime, endTime) {
    let allSignatures = []; // Array to store all transaction signatures.
    let before = undefined;  // Variable to keep track of the pagination in the transaction history.

    // Loop to fetch transactions until all relevant ones are obtained.
    while (true) {
        // Fetch transactions for the address, paginated by 1000.
        const signatures = await connection.getSignaturesForAddress(publicKey, {
            before,
            limit: 1000
        });

        // Break the loop if no signatures are returned.
        if (signatures.length === 0) {
            break;
        }

        // Filter signatures based on the provided time range.
        const filteredSignatures = signatures.filter(sig => sig.blockTime >= startTime && sig.blockTime <= endTime);
        allSignatures.push(...filteredSignatures); // Add the filtered signatures to the allSignatures array.

        // Break the loop if the last signature's block time is earlier than the start time.
        if (signatures[signatures.length - 1].blockTime < startTime) {
            break;
        }

        // Set the before parameter to the last signature's signature for pagination.
        before = signatures[signatures.length - 1].signature;
    }

    console.log(allSignatures)

    // Return all collected signatures.
    return allSignatures;
}

// Function to fetch and categorize transactions related to a specific Candy Machine.
async function fetchCandyMachineMintTransactions(candyMachineAddress, startTime, endTime) {
    // Establish a connection to the Solana blockchain.
    const connection = new Connection(config.rpc, 'confirmed');
    // Convert the Candy Machine address string to a PublicKey.
    const candyMachinePublicKey = new PublicKey(candyMachineAddress);

    // Fetch all transaction signatures for the Candy Machine within the specified time range.
    const signatures = await fetchAllTransactions(connection, candyMachinePublicKey, startTime, endTime);

    // Initialize a progress bar to track the processing of transactions.
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(signatures.length, 0);

    // CSV header row.
    const csvRows = ['Signature,BotName,Fee'];
    // Count of transactions that are not marked as bot transactions.
    let unmarkedTxCount = 0;
    // Object to keep track of the number of transactions for each bot.
    let botTransactionCounts = Object.fromEntries(Object.keys(botAddresses).map(bot => [bot, 0]));

    // Define the size of each batch of transactions to process.
    const batchSize = 100;
    // Process transactions in batches.
    for (let i = 0; i < signatures.length; i += batchSize) {
        // Create promises for each batch of transactions.
        const batchPromises = signatures.slice(i, i + batchSize).map(signatureInfo =>
            connection.getParsedTransaction(signatureInfo.signature, {
                maxSupportedTransactionVersion: 0
            })
        );

        // Resolve all promises and get the transactions.
        const transactions = await Promise.all(batchPromises);

        // Process each transaction.
        for (const transaction of transactions) {
            try {
                if (transaction && transaction.meta && transaction.meta.err === null) {
                    // Check for the specific log message indicating a valid Candy Machine mint transaction.
                    if (transaction.meta.logMessages && transaction.meta.logMessages.some(log => log.startsWith('Program log: Create')) || transaction.meta.logMessages.some(log => log.startsWith('Program log: Instruction: MintToCollectionV1'))) {
                        let involvedAddress = transaction.transaction.message.addressTableLookups[0].accountKey.toString();
                        const fee = transaction.meta.fee / 1e9; // Convert lamports to SOL
                        let isBotTransaction = false;

                        for (const [name, botAddress] of Object.entries(botAddresses)) {
                            if (involvedAddress === botAddress) {
                                const signature = transaction.transaction.signatures[0];
                                csvRows.push(`${signature},${name},${fee.toFixed(9)}`);
                                botTransactionCounts[name]++;
                                isBotTransaction = true;
                                break;
                            }
                        }

                        if (!isBotTransaction) {
                            unmarkedTxCount++;
                        }
                    }
                }
            } catch (error) {
                unmarkedTxCount++;
            }

            // Increment the progress bar.
            progressBar.increment();
        }
    }

    // Stop the progress bar.
    progressBar.stop();

    // Write the CSV data to a file.
    fs.writeFileSync('transactions.csv', csvRows.join('\n'));
    console.log('CSV file created: transactions.csv');

    // Log the transaction counts for each bot and unmarked transactions.
    for (const [botName, count] of Object.entries(botTransactionCounts)) {
        console.log(`${botName} Mints: ${count}`);
    }
    console.log('Unmarked Mints:', unmarkedTxCount.toString());
}


// Using values from the config file
const candyMachineAddress = config.candyMachineAddress;
const startTime = config.startTime; // Using start time from config
const endTime = config.endTime; // Using end time from config
fetchCandyMachineMintTransactions(candyMachineAddress, startTime, endTime);

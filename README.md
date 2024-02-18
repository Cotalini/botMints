# 🤖 botMints

## 📝 Description

botMints is a Node.js application designed to fetch and analyze transactions from the Solana blockchain, focusing on Candy Machine transactions 🍬. It categorizes transactions, calculates fees, and outputs data into a user-friendly CSV format 📊. This tool is especially useful for monitoring and auditing blockchain transactions to identify bot activities 🕵️‍♂️.

## 📋 Requirements

Before installing botMints, ensure you have the following:
- Node.js (version 12.9.1 or higher) installed. [Download Node.js](https://nodejs.org/)
- npm (usually comes with Node.js) for managing packages.
- Git for cloning the repository. [Download Git](https://git-scm.com/downloads)
- Basic understanding of terminal or command prompt commands.

## ⭐ Features

- Fetch transactions from a specified Candy Machine address within a given time range 📅.
- Categorize transactions based on bot involvement 🤔.
- Calculate transaction fees and convert them to SOL 💰.
- Output transaction data into a CSV file for easy analysis 📈.
- Visual progress bar for transaction processing 🚀.

## 🛠 Installation

To install botMints, follow these detailed steps:

1. **Clone the repository 📁:**
   Open your terminal or command prompt and run:
   ```bash
   git clone https://github.com/yourusername/botMints.git
2. **Navigate to the project directory 🚀:**
    Change your current directory to botMints:
    ```bash
    cd botMints
3. **Install the necessary dependencies 📦:**
    Execute the following command to install all required dependencies:
    ```bash
    npm install
4. **Run botMints:**
  

## ⚙️ Configuration
Adjust the config.json file to set up your specific parameters 🔧:
```json
{
    "startTime": 1708210800,
    "endTime": 1708210860,
    "rpc": "https://swr.xnftdata.com/rpc-proxy/",
    "address": {
        "Blood": "FHPu14ZCs6R7Rn6ayAcszxBy6J4GL7EcYJELY2oVMhWe",
        "Pepper": "FUigYUS3EPJB682u6mCgvox7JMfHn6KxqhYdnLmqm2pe",
        ...
    }
}
```

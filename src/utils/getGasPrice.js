const ARBITRUM_MAINNET_API = process.env.ARBITRUM_MAINNET_API

async function getGasPrice() {
    // make an API call to the ABIs endpoint
    const provider = new ethers.JsonRpcProvider(ARBITRUM_MAINNET_API)
    const feeData = await provider.getFeeData()

    return feeData.maxFeePerGas
}

exports.getGasPrice = getGasPrice
// Path: web3refresherL7/src/utils/utilities.js

// --------ETHERSCAN API CALL OPTION--------

// const ARBSCAN_API_KEY = process.env.ARBSCAN_API_KEY

// async function getGasPrice() {
//     // make an API call to the ABIs endpoint
//     const response = await fetch(
//         `https://api.arbiscan.io/api?module=proxy&action=eth_gasPrice&apikey=${ARBSCAN_API_KEY}`,
//     )
//     const data = await response.json()

//     // print the JSON response
//     let abi = BigInt(data.result)

//     return abi
// }

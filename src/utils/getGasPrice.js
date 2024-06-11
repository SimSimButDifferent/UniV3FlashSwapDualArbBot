const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

async function getGasPrice() {
    // make an API call to the ABIs endpoint
    const response = await fetch(
        `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_KEY}`,
    )
    const data = await response.json()

    // print the JSON response
    let abi = data.result
    console.log(abi.SafeGasPrice)
    return abi.SafeGasPrice
}

getGasPrice()

exports.getGasPrice = getGasPrice
// Path: web3refresherL7/src/utils/utilities.js

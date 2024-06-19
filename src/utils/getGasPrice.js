const ARBSCAN_API_KEY = process.env.ARBSCAN_API_KEY

async function getGasPrice() {
    // make an API call to the ABIs endpoint
    const response = await fetch(
        `https://api.arbiscan.io/api?module=proxy&action=eth_gasPrice&apikey=${ARBSCAN_API_KEY}`,
    )
    const data = await response.json()

    // print the JSON response
    let abi = BigInt(data.result)
    // console.log(abi)
    return abi
}

getGasPrice()

exports.getGasPrice = getGasPrice
// Path: web3refresherL7/src/utils/utilities.js

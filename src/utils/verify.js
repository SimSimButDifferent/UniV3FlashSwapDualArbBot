const hre = require("hardhat")

async function verify(contractAddress) {
    try {
        await hre.run("verify:verify", {
            address: contractAddress,
        })
        console.log("Contract verified! : ", contractAddress)
    } catch (error) {
        console.error("Verification failed: ", error)
    }
    console.log("--------------------------------------------------")
}

module.exports = { verify }

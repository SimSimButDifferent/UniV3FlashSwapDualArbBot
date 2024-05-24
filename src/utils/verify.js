const hre = require("hardhat")

async function verify(contractAddress) {
    await hre.run("verify:verify", {
        address: contractAddress,
    })
    console.log("Contract verified! : ", contractAddress)
    console.log("--------------------------------------------------")
}

verify().catch((error) => {
    console.error(error)
    process.exitCode = 1
})

exports.verify = verify

'use strict';

const { Gateway, FileSystemWallet  } =require('fabric-network')
const path = require('path')
const fs = require('fs')

const configPath = path.join(process.cwd(), 'config.json')
const configJSON = fs.readFileSync(configPath, 'utf8')
const config = JSON.parse(configJSON)

// Configuration file path
const ccpPath = path.join(process.cwd(), config.connection_file)
const ccpJSON = fs.readFileSync(ccpPath)
const ccp = JSON.parse(ccpJSON)

async function main(){
  try {
    // connecting to wallet
    const walletPath = path.join(process.cwd(), 'wallet1')
    const wallet = new FileSystemWallet(walletPath)

    const identityExists = await wallet.exists('org1Admin')
    if(!identityExists){
      throw new Error(`org1Admin identity doesn't exist`)
    }

    // creating a new gateway giving it network configruation and connection profile
    console.info('connecting to gateway....')
    const gateway = new Gateway()
    await gateway.connect(ccp,{ wallet: wallet, identity: 'org1Admin', discovery: {enabled: true, asLocalhost: true}})
    // connection to a channel
    console.log('connecting to network....')
    const network = await gateway.getNetwork('mychannel')
    // fetching contract from connected network
    const contract = network.getContract('testContract')

    const result = await contract.evaluateTransaction('queryParties', 'PARTY0')

    console.log(`result: ${result.toString()}`)

  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    process.exit(1);
  }
}

main()
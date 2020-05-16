'use strict';

const { Gateway, FileSystemWallet  } =require('fabric-network')
const path = require('path')

const { objGenerator } = require('./utils')

const config = objGenerator('config.json')

// Configuration file path
const ccp = objGenerator(config.connection_file);

// query
const query = config.query

async function main(){
  const gateway = new Gateway()
  try {
    // connecting to wallet
    const walletPath = path.join(process.cwd(), config.wallet)
    const wallet = new FileSystemWallet(walletPath)

    const identityExists = await wallet.exists(config.user)
    if(!identityExists){
      throw new Error(`${config.user} identity doesn't exist`)
    }

    // creating a new gateway giving it network configruation and connection profile
    console.info('connecting to gateway....')
    await gateway.connect(ccp,{ wallet: wallet, identity: config.user, discovery: {enabled: true, asLocalhost: true}})
    
    // connection to a channel
    console.log('connecting to network....')
    const network = await gateway.getNetwork(config.channel)
    
    // fetching contract from connected network
    const contract = network.getContract(config.contract)

    const result = await contract.evaluateTransaction(query.fcn, ...query.args)

    console.log(`result: ${result.toString()}`)

  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    process.exit(1);
  } finally{
    console.log('Disconnecting gateway....')
    gateway.disconnect();
  }
}

main()
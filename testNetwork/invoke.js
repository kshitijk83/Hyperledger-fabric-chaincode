'use strict';

const { Gateway, FileSystemWallet } = require('fabric-network')
const path = require('path')
const fs = require('fs')
const { objGenerator } = require('./utils')

const config = objGenerator('config.json')

const ccp = objGenerator(config.connection_file)

const invoke = config.invoke

async function main(){
  const gateway = new Gateway();

  try {
    const walletPath = path.join(process.cwd(), config.wallet)
    const wallet = new FileSystemWallet(walletPath) 
    
    const identityExists = await wallet.exists(config.user)
    if(!identityExists){
      throw new Error(`${config.user} identity doesn't exist`)
    }
    console.info('connecting to gateway....')
    await gateway.connect(ccp, {wallet, identity: config.user, discovery:{enabled:true, asLocalhost:true}})

    const network = await gateway.getNetwork(config.channel)
    const contract = await network.getContract(config.contract)

    const result = await contract.submitTransaction(invoke.fcn, ...invoke.args)
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
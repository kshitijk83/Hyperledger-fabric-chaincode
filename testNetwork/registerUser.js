'use strict'

const { Gateway, FileSystemWallet, X509WalletMixin } = require('fabric-network')
const fs = require('fs')
const path = require('path')
const { objGenerator } = require('./utils')

const config = objGenerator('config.json')
const ccp = objGenerator(config.connection_file)

async function main(){
    const gateway = new Gateway();

    try {
        const walletPath = path.join(process.cwd(), config.wallet)
        const wallet = new FileSystemWallet(walletPath)
        
        const userExists = await wallet.exists(config.user)
        if(userExists){
            throw new Error(`${config.user} already exists`)
        }

        const adminExists = await wallet.exists(config.adminUser)
        if(!adminExists){
            throw new Error(`An identity for the admin user "${config.adminUser}" does not exist in the wallet`)
        }

        await gateway.connect(ccp, {wallet, identity:config.adminUser, discovery:{asLocalhost:true, enabled:true}})

        // get CA client from gateway to interact with CA
        const ca = gateway.getClient().getCertificateAuthority()
        // getting admin indentity(current identity that is doing trans.) to enroll new user
        const adminIdentity = gateway.getCurrentIdentity()

        // register the user, enroll, import to wallet
        const secret = await ca.register({
            affiliation: "org1.department1",
            enrollmentID: config.user,
            role: 'client'
            }, adminIdentity)
        const enrollment = await ca.enroll({enrollmentID: config.user, enrollmentSecret: secret})
        const userIdentity = X509WalletMixin.createIdentity(config.orgMSPID, enrollment.certificate, enrollment.key.toBytes())
        wallet.import(config.user, userIdentity)
        console.log('Successfully registered and enrolled admin user ' + config.user + ' and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to register user ${config.user}: ${error}`);
        process.exit(1);
    } finally{
        console.log('disconnectiong gateway....')
        gateway.disconnect()
    }
}

main()
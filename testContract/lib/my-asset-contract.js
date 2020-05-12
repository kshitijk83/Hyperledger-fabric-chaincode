/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class MyAssetContract extends Contract {
    //update ledger with a greeting to show that the function was called
    async instantiate(ctx) {
        console.info('===============Instantiating Ledger================');
        const voting = [
            {
                party: 'party1',
                votes: 0,
            },
            {
                party: 'party2',
                votes: 0,
            },
        ];
        for (let i = 0; i < voting.length; i++) {
            voting[i].docType = 'party';
            await ctx.stub.putState(
                'PARTY' + i,
                Buffer.from(JSON.stringify(voting[i]))
            );
            console.info('Added <--> ', voting[i]);
        }
        console.log('===============END: Instantiating Ledger================');
    }

    async queryParties(ctx, partyNumber) {
        const partyAsBytes = await ctx.stub.getState(partyNumber);
        if (!partyAsBytes || partyAsBytes.length === 0) {
            throw new Error(`${partyNumber} does not exist`);
        }
        console.log(partyAsBytes.toString());
        return partyAsBytes.toString();
    }

    async incrementVote(ctx, partyNumber) {
        const partyAsBytes = await ctx.stub.getState(partyNumber);
        if (!partyAsBytes || partyAsBytes.length === 0) {
            throw new Error(`${partyNumber} does not exist`);
        }
        const partyObj = JSON.parse(partyAsBytes.toString());
        partyObj.votes++;
        await ctx.stub.putState(
            partyNumber,
            Buffer.from(JSON.stringify(partyObj))
        );
        console.log('============ END: IncrementedVote ==============');
    }

    async addParty(ctx, partyName) {
        var partyObj = {
            docType: 'party',
            votes: 0,
            party: partyName,
        };
        await ctx.stub.putState(
            partyName,
            Buffer.from(JSON.stringify(partyObj))
        );
        console.info('================ END: Car Created ==================');
    }
}

module.exports = MyAssetContract;

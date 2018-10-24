/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');


/*BTC Library*/
const btcMsg = require('bitcoinjs-message');
const btc = require('bitcoinjs-lib');



//Block
const Block = require('./block');
//Permission
const Permisssion = require('./errorLog');
//ValidationResponse
const ValidationResponse = require('./validationResp');
//Registry
const Registry = require('./registry');
//Utils
const Utils = require("./utils");




/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
    constructor(){
        this.chain = [];
        this.empty = true;
        this.nextBlockHeight = 0;
        //this.addBlock(new Block("First block in the chain - Genesis block"));
    }

    // Add new block
    async addBlock(newBlock){

        // Block height
        let height =  await Utils.getBlockHeight()
            .then(value =>{
                console.log(value);
                return value;
            })
            .catch(err=>{
                console.log(err);
                return 0;
            });

        if (height === 0){
            let genesisBlock = new Block("First block in the chain - Genesis block","{\n" +
                "    \"dec\": \"Genesis Block\",\n" +
                "    \"ra\": \"Genesis Block\",\n" +
                "    \"story\": \"Genesis Block\"\n" +
                "  }")
            genesisBlock.time =
            // Block hash with SHA256 using newBlock and converting to a string
            genesisBlock.hash = SHA256(JSON.stringify(genesisBlock)).toString();
            //Adding Genesis Block to chain
            this.chain.push(genesisBlock);
            let createdBlock = await Utils.saveBlock(genesisBlock)
                .then(value =>{
                    //console.log(value);
                    return value;
                })
                .catch(err=>{
                    console.log(err);
                    return 0;
                });

            if (createdBlock){
                newBlock.height = createdBlock.height + 1;
                // UTC timestamp
                newBlock.time = Utils.getTimeStamp();
                //Previous Hash
                newBlock.previousBlockHash = createdBlock.hash;

                // Block hash with SHA256 using newBlock and converting to a string
                newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                // Adding block object to chain
                this.chain.push(newBlock);
                createdBlock = await Utils.saveBlock(newBlock)
                    .then(value =>{
                        //console.log(value);
                        return value;
                    })
                    .catch(err=>{
                        console.log(err);
                        return 0;
                    });
            }
            return createdBlock;
        }else{
            newBlock.height = height;
            // UTC timestamp
            newBlock.time = Utils.getTimeStamp();
            // previous block hash
            let lastBlock = await Utils.getBlockByHeight((newBlock.height ===  0) ? 0 : newBlock.height - 1)
                .then(value =>{
                    //console.log(value);
                    return value;
                })
                .catch(err=>{
                    console.log(err);
                    return 0;
                });

            if(newBlock.height>0){
                newBlock.previousBlockHash = lastBlock.hash;
            }
            // Block hash with SHA256 using newBlock and converting to a string
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
            // Adding block object to chain
            this.chain.push(newBlock);
            let createdBlock = await Utils.saveBlock(newBlock)
                .then(value =>{
                    //console.log(value);
                    return value;
                })
                .catch(err=>{
                    console.log(err);
                    return 0;
                });
            return createdBlock;
        }
    }

    // Validate blockchain
    async validateChain(){
        let errorLog = [];
        let blockChainWKeys = [];
        blockChainWKeys =  await Utils.getBlockChain()
            .then(value =>{
                //console.log(value);
                return value;
            })
            .catch(err=>{
                console.log(err);
                return err;
            });
        //console.log(blockChainWKeys);
        let blockChain = [];
        for (var i = 0; i < blockChainWKeys.length-1; i++) {
            blockChain.push(JSON.parse(blockChainWKeys[i].value));
        }

        for (var i = 0; i < blockChain.length-1; i++) {
            // validate block
            if (!Utils.validateBlock(i))
                errorLog.push(i);
            // compare blocks hash link
            let blockHash = blockChain[i].hash;
            let previousHash = blockChain[i+1].previousBlockHash;
            if (blockHash!==previousHash) {
                errorLog.push(i);
            }
        }
        if (errorLog.length>0) {
            console.log('Block errors = ' + errorLog.length);
            console.log('Blocks: '+errorLog);
        } else {
            console.log('No errors detected');
        }
    }



    /*Validation Section
    =====================================================================================*/

    static async validate(signature,address){
        let vald = new ValidationResponse(address,signature);
        let lastKey = await Utils.getLastKey()
            .then((value)=>{
                return value;
            })
            .catch((err)=>{
                console.log(err);
                return 0;
            })

        if (lastKey > 0){
            lastKey = lastKey - 1;
        };

        let registry = await Utils.getRegistry(lastKey)
            .then(value => {
                return value;
            })
            .catch(err => {
                console.log(err);
                return 0;
            });

        //Validate Time Window
        let initTime = registry.requestTimeStamp;
        let finalTime = Utils.getTimeStamp();
        let timeDiff = finalTime - initTime;

        console.log(timeDiff);

        let isValidTime = false;
        if(timeDiff < registry.validationWindow){
            isValidTime = true;
        }

        //Validate signature
        let isValidSignature = false;
        try{
            isValidSignature = btcMsg.verify(registry.message,registry.address,signature);
        }catch(error){
            console.log(error);
            isValidSignature = false;
        }

        if(isValidSignature && isValidTime){
            vald.registerStar = true;
            vald.status.address = registry.address;
            vald.status.requestTimeStamp = registry.requestTimeStamp;
            vald.status.message = registry.message;
            vald.status.validationWindow = registry.validationWindow - timeDiff;
            vald.status.messageSignature = "valid";
        }else{
            vald.registerStar = false;
            vald.status.address = registry.address;
            vald.status.requestTimeStamp = registry.requestTimeStamp;
            vald.status.message = registry.message;
            vald.status.validationWindow = registry.validationWindow - timeDiff;
            vald.status.messageSignature = "notValid";
        }

        //Get last inserted validation Key
        let key = await Utils.getLastValKey()
            .then((value)=>{
                return value;
            })
            .catch((err)=>{
                console.log(err);
                return 0;
            });

        let savedVal = await Utils.saveValidation(vald,key)
            .then((value) => {
                console.log("Object stored ");
                return value;
            })
            .catch((err) =>{
                console.log(err);
            });

        return savedVal;
    }

}

module.exports = Blockchain;



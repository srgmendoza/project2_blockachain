/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');

/*Adding Level*/

const level = require('level');
const chainDB = './chaindata_New';
const db = level(chainDB,{ valueEncoding:'json' });

//Block
const Block = require('./block');





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
        let height =  await this.getBlockHeight()
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
            genesisBlock.time = new Date().getTime().toString().slice(0,-3);
            // Block hash with SHA256 using newBlock and converting to a string
            genesisBlock.hash = SHA256(JSON.stringify(genesisBlock)).toString();
            //Adding Genesis Block to chain
            this.chain.push(genesisBlock);
            let createdBlock = await this.saveBlock(genesisBlock)
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
                newBlock.time = new Date().getTime().toString().slice(0,-3);
                //Previous Hash
                newBlock.previousBlockHash = createdBlock.hash;

                // Block hash with SHA256 using newBlock and converting to a string
                newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                // Adding block object to chain
                this.chain.push(newBlock);
                createdBlock = await this.saveBlock(newBlock)
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
            newBlock.time = new Date().getTime().toString().slice(0,-3);
            // previous block hash
            let lastBlock = await this.getBlockByHeight((newBlock.height ===  0) ? 0 : newBlock.height - 1)
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
            let createdBlock = await this.saveBlock(newBlock)
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

    //Save Block
    saveBlock(block){
        return new Promise (function(resolve, reject){
            db.put(block.height, block,function(err){
                if (err){
                    reject(err);
                }
                resolve(block);
            })
        })
    }

    // Get block height
    getBlockHeight(){
        return new Promise (function (resolve,reject){
            let i = 0;
            db.createReadStream()
                .on('data', function (data) {
                    //console.log('key=', data)
                    i++;
                })
                .on('error', function(err) {
                    reject(err);
                    return console.log('Unable to read data stream!', err)
                })
                .on('close', function () {
                    resolve(i);
                })
        })
    }

    // get block by height
    getBlockByHeight(blockHeight){
        return new Promise (function(resolve,reject){
            db.get(blockHeight, function (err, value){
                if (err){
                    reject(err);
                }
                value.body.star.story =  Blockchain.hex2a(value.body.star.story);
                resolve(value);
            })
        })
    }

    // get blocks by address
    async getBlockByAddress(address){
        return new Promise (function (resolve,reject){
            let filteredBlocks = [];
            db.createReadStream()
                .on('data', function (data) {
                    //console.log('key=', data)
                    if (data.value.body.address == address){
                        data.value.body.star.story =  Blockchain.hex2a(data.value.body.star.story);
                        filteredBlocks.push(data.value);
                    }
                })
                .on('error', function(err) {
                    reject(err);
                    return console.log('Unable to read data stream!', err)
                })
                .on('close', function () {
                    resolve(filteredBlocks);
                })
        })
    }

    // get blocks by address
    async getBlockByHash(hash){
        return new Promise (function (resolve,reject){
            let filteredBlocks = [];
            db.createReadStream()
                .on('data', function (data) {
                    //console.log('key=', data)
                    if (data.value.hash == hash){
                        data.value.body.star.story =  Blockchain.hex2a(data.value.body.star.story);
                        filteredBlocks.push(data.value);
                    }
                })
                .on('error', function(err) {
                    reject(err);
                    return console.log('Unable to read data stream!', err)
                })
                .on('close', function () {
                    resolve(filteredBlocks);
                })
        })
    }

    // validate block
    async validateBlock(blockHeight){
        // get block object
        let block = JSON.parse( await this.getBlockByHeight(blockHeight)
            .then(value =>{
                //console.log(value);
                return value;
            })
            .catch(err=>{
                console.log(err);
                return err;
            }));
        // get block hash
        let blockHash = block.hash;
        // remove block hash to test block integrity
        block.hash = '';
        // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        // Compare
        if (blockHash===validBlockHash) {
            return true;
        } else {
            console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
            return false;
        }
    }

    // Validate blockchain
    async validateChain(){
        let errorLog = [];
        let blockChainWKeys = [];
        blockChainWKeys =  await this.getBlockChain()
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
            if (!this.validateBlock(i))
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

    getBlockChain(){
        return new Promise (function (resolve,reject){
            let chain = [];
            db.createReadStream()
                .on('data', function (data) {
                    //console.log('key=', data)
                    chain.push(data);
                })
                .on('error', function(err) {
                    reject(err);
                    return console.log('Unable to read data stream!', err)
                })
                .on('close', function () {
                    resolve(chain);
                })
        })
    }

    static hex2a(hexx) {
        var hex = hexx.toString();//force conversion
        var str = '';
        for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str;
    }
}

module.exports = Blockchain;


// let block;
// let bc;
// (function theLoop (i) {
//   setTimeout(function () {

//     if (i==0){
//       block = new Block("First block in the chain - Genesis block");
//        bc = new Blockchain();
//       bc.addBlock(block);
//     }else{
//       block = new Block("Test Block - " + (i + 1));
//       bc.addBlock(block);
//     }
//      // bc = new Blockchain();
//       //bc.validateChain();
//       i++;
//       if (i < 10) theLoop(i);
//   }, 100);

//   // console.log(JSON.stringify(bc));
// })(0);
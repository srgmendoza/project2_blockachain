/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');

/*Adding Level*/

const level = require('level');
const chainDB = './chaindata_New';
const db = level(chainDB);``


/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

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
    newBlock.height =  await this.getBlockHeight()
                      .then(value =>{
                        console.log(value);
                        return value;
                      })
                      .catch(err=>{
                        console.log(err);
                        return err;
                      });
  

    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    // previous block hash
    let lastBlock = JSON.parse( await this.getBlock((newBlock.height ===  0) ? 0 : newBlock.height - 1)
                    .then(value =>{
                      //console.log(value);
                      return value;
                    })
                    .catch(err=>{
                      console.log(err);
                      return 0;
                    }));
    

    if(newBlock.height>0){
      newBlock.previousBlockHash = lastBlock.hash;
    }
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    // Adding block object to chain
    this.chain.push(newBlock);


    var validateBlockExistence = function(key){
      return new Promise (function(resolve,reject){
        db.get(key, function (err, value){
          if (!err){
            if (!value.body.includes("Genesis")){
              resolve(value);
            }else{
              resolve(false);
            }
            
          }
          reject(false);
        })
      })
    }

    var storeLevelDB = function (key, value){
      return new Promise (function (resolve,reject){
        db.put(key, value,function(err){
          if (err){
            reject(err);
          } 
          resolve(value);
        })
      })
    }
    
    var saveBlock = function () {
      validateBlockExistence (newBlock.height)
        .then(function (value){console.log("It Exists!")})
        .catch(function (value){storeLevelDB(newBlock.height,JSON.stringify(newBlock).toString())
                .then(function (value){console.log(value)})
                .catch(function (error){console.log(error)})})
    }
      
    //Verify if the block Already Exists
    saveBlock();

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

    // get block
    getBlock(blockHeight){
      // return object as a single string
      //return JSON.parse(JSON.stringify(this.chain[blockHeight]));
      return new Promise (function(resolve,reject){
        db.get(blockHeight, function (err, value){
          if (err){
            reject(err);
            //return console.log('Not found key! ' + blockHeight, err);
          }
          //reject(err);
          resolve(value);
        })
      })
    }

    // validate block
    async validateBlock(blockHeight){
      // get block object
      let block = JSON.parse( await this.getBlock(blockHeight)
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
}


let block;
let bc;
(function theLoop (i) {
  setTimeout(function () {

    if (i==0){
      block = new Block("First block in the chain - Genesis block");
       bc = new Blockchain();
      bc.addBlock(block);
    }else{
      block = new Block("Test Block - " + (i + 1));
      bc.addBlock(block);
    }
     // bc = new Blockchain();
      //bc.validateChain();
      i++;
      if (i < 10) theLoop(i);
  }, 100);
  
  // console.log(JSON.stringify(bc));
})(0);
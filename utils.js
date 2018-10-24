const level = require('level');

//Validations DB
const validationDB = './DataBases/validationData';
const dbVal = level(validationDB,{ valueEncoding:'json' });
//Registries DB
const registryDB = './DataBases/registryData';
const dbReg = level(registryDB,{ valueEncoding:'json' });
//BlockchainDB
const chainDB = './DataBases/blockchainData';
const db = level(chainDB,{ valueEncoding:'json' });

//Permissions
const Permission = require('./errorLog');

class Utils{
    constructor(){

    }

    static getTimeStamp(){
        return new Date().getTime().toString().slice(0,-3);
    }

    static hex2a(hexx) {
        var hex = hexx.toString();//force conversion
        var str = '';
        for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str;
    }

    static timeWindow(){
        return 300;
    }

    /*==========================================================================
    DataBase Static Methods
    ============================================================================*/

    /*++++++++++++++++++++++++++
    Validation DB Methods
    +++++++++++++++++++++++++++*/

    static async saveValidation(resp, key){
        return new Promise ((resolve, reject) => {
            dbVal.put(key,resp,(err)=>{
                if (err){
                    reject(err);
                }
                resolve(resp);
            })
        })
    }

    static async getLastValKey(){
        return new Promise ((resolve,reject) =>{
            let i = 0;
            dbVal.createReadStream()
                .on('data', (data) => {
                    //console.log('key=', data)
                    i++;
                })
                .on('error', (err) => {
                    reject(err);
                    return console.log('Unable to read data stream!', err)
                })
                .on('close', () => {
                    resolve(i);
                })
        })
    }

    static async getValidation(address){
        return new Promise ((resolve,reject) => {
            let filteredVald = [];
            dbVal.createReadStream()
                .on('data', function (data) {
                    if (data.value.status.address == address){
                        filteredVald.push(data);
                    }
                })
                .on('error', function(err) {
                    reject(err);
                    return console.log('Unable to read data stream!', err)
                })
                .on('close', function () {

                    let result = filteredVald.filter(obj => {
                        return obj.key == Math.max.apply(Math, filteredVald.map((o) =>
                            {
                                return o.key;
                            }))
                    })

                    resolve(result);
                })
        })
    }

    static async setUsed(key, result){
        return new Promise ((resolve, reject) => {
            dbVal.put(key,result,(err)=>{
                if (err){
                    reject(err);
                }
                resolve(result);
            })
        })
    }

    /*++++++++++++++++++++++++++
    Registry DB Methods
    +++++++++++++++++++++++++++*/

    // get registries by address
    static async getRegistryByAddress(address){
        return new Promise ((resolve,reject) =>{
            let filteredRegs = [];
            dbReg.createReadStream()
                .on('data', (data) => {
                    console.log( data)
                    let actualTS = new Date().getTime().toString().slice(0,-3);
                    let diff = actualTS - data.value.requestTimeStamp;
                    if (data.value.address == address && data.value.validationWindow == Utils.timeWindow()){
                        filteredRegs.push(data.value);
                    }
                })
                .on('error',(err) => {
                    reject(err);
                    return console.log('Unable to read data stream!', err)
                })
                .on('close', () => {
                    //let reg = Math.min.apply(Math, filteredRegs.map((o) => { return o.requestTimeStamp; }))
                    let result = filteredRegs.filter(obj => {
                        return obj.requestTimeStamp == Math.max.apply(Math, filteredRegs.map((o) =>
                            {
                                return o.requestTimeStamp;
                            }))
                            && obj.validationWindow == Utils.timeWindow();
                    })
                    resolve(result);
                })
        })
    }

    static async saveRegistry(resp, key){
        return new Promise ((resolve, reject) => {
            dbReg.put(key,resp,(err)=>{
                if (err){
                    reject(err);
                }
                resolve(resp);
            })
        })
    }

    static async getLastKey(){
        return new Promise ((resolve,reject) =>{
            let i = 0;
            dbReg.createReadStream()
                .on('data', (data) => {
                    //console.log('key=', data)
                    i++;
                })
                .on('error', (err) => {
                    reject(err);
                    return console.log('Unable to read data stream!', err)
                })
                .on('close', () => {
                    resolve(i);
                })
        })
    }

    static async getRegistry(key){
        return new Promise ((resolve,reject) => {
            dbReg.get(key, (err, value) => {
                if (err){
                    reject(err);
                }
                resolve(value);
            })
        })
    }

    /*++++++++++++++++++++++++++
    Blockchain DB Methods
    +++++++++++++++++++++++++++*/

    // validate block
    static async validateBlock(blockHeight){
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

    // get blocks by hash
    static async getBlockByHash(hash){
        return new Promise (function (resolve,reject){
            let filteredBlocks = [];
            db.createReadStream()
                .on('data', function (data) {
                    //console.log('key=', data)
                    if (data.value.hash == hash){
                        data.value.body.star.storyDecoded =  Utils.hex2a(data.value.body.star.story);
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
    static async getBlockByAddress(address){
        return new Promise (function (resolve,reject){
            let filteredBlocks = [];
            db.createReadStream()
                .on('data', function (data) {
                    //console.log('key=', data)
                    if (data.value.body.address == address){
                        data.value.body.star.storyDecoded =  Utils.hex2a(data.value.body.star.story);
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

    // get block by height
    static getBlockByHeight(blockHeight){
        return new Promise (function(resolve,reject){
            db.get(blockHeight, function (err, value){
                if (err){
                    reject(err);
                }else{
                    //value.body.star.storyDecoded =  Utils.hex2a(value.body.star.story);
                }
                resolve(value);
            })
        })
    }

    // Get block height
    static getBlockHeight(){
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

    //Save Block
    static saveBlock(block){
        return new Promise (function(resolve, reject){
            db.put(block.height, block,function(err){
                if (err){
                    reject(err);
                }
                resolve(block);
            })
        })
    }


    static getBlockChain(){
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


module.exports = Utils;
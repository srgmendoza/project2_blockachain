const btcMsg = require('bitcoinjs-message');
const btc = require('bitcoinjs-lib');
const MessageResponse = require('./messageResp');
const ValidationResponse = require('./validationResp');

//Level for store registry request
const level = require('level');
const registryDB = './registryData';
const db = level(registryDB,{ valueEncoding:'json' });


class Validator{

    constructor(address){
        this.address = address;
        this.timeWindow = 300; //Set to 300 Seg = 5min
    }

    async starRegistry(){

        //Get last inserted Key
        let key = await this.getLastKey()
            .then((value)=>{
                return value;
            })
            .catch((err)=>{
                console.log(err);
                return 0;
            });

        if(key > 0){
            let lastRegistry = await this.getRegistryByAddress(this.address)
                .then(value => {
                    return value;
                })
                .catch(err => {
                    console.log(err);
                    return 0;
                });

            // console.log(lastRegistry);
            if(lastRegistry.length > 0){
                if(lastRegistry[0].address == this.address){
                    let resp = new MessageResponse(lastRegistry[0].address);
                    resp.requestTimeStamp = this.getTimeStamp();
                    resp.message = resp.address + ':' + resp.requestTimeStamp + ':' + 'starRegistry';
                    let diff = lastRegistry[0].validationWindow - (resp.requestTimeStamp - lastRegistry[0].requestTimeStamp);
                    resp.validationWindow =  (((diff) >= 0) ? diff : this.timeWindow);

                    let savedObj = await this.saveRegistry(resp,key)
                        .then((value) => {
                            console.log("Object stored ");
                            return value;
                        })
                        .catch((err) =>{
                            console.log(err);
                        });

                    console.log(JSON.stringify(savedObj));
                    return savedObj;
                }else{
                    let resp = new MessageResponse(this.address);
                    resp.requestTimeStamp = this.getTimeStamp();
                    resp.message = resp.address + ':' + resp.requestTimeStamp + ':' + 'starRegistry';
                    resp.validationWindow = this.timeWindow;

                    let savedObj = await this.saveRegistry(resp,key)
                        .then((value) => {
                            console.log("Object stored ");
                            return value;
                        })
                        .catch((err) =>{
                            console.log(err);
                        });

                    console.log(JSON.stringify(savedObj));
                    return savedObj;
                }
            }else{
                let resp = new MessageResponse(this.address);
                resp.requestTimeStamp = this.getTimeStamp();
                resp.message = resp.address + ':' + resp.requestTimeStamp + ':' + 'starRegistry';
                resp.validationWindow = this.timeWindow; //Set to 300 Seg = 5min

                let savedObj = await this.saveRegistry(resp,key)
                    .then((value) => {
                        console.log("Object stored ");
                        return value;
                    })
                    .catch((err) =>{
                        console.log(err);
                    });


                console.log(JSON.stringify(savedObj));
                return savedObj;
            }
        }else{
            let resp = new MessageResponse(this.address);
            resp.requestTimeStamp = this.getTimeStamp();
            resp.message = resp.address + ':' + resp.requestTimeStamp + ':' + 'starRegistry';
            resp.validationWindow = this.timeWindow; //Set to 300 Seg = 5min

            let savedObj = await this.saveRegistry(resp,key)
                .then((value) => {
                    console.log("Object stored ");
                    return value;
                })
                .catch((err) =>{
                    console.log(err);
                });


            console.log(JSON.stringify(savedObj));
            return savedObj;
        }

    }

    // get registries by address
    async getRegistryByAddress(address){
        return new Promise ((resolve,reject) =>{
            let filteredRegs = [];
            db.createReadStream()
                .on('data', (data) => {
                    console.log( data)
                    let actualTS = new Date().getTime().toString().slice(0,-3);
                    let diff = actualTS - data.value.requestTimeStamp;
                    if (data.value.address == address && data.value.validationWindow == this.timeWindow){
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
                            && obj.validationWindow == this.timeWindow;
                    })
                    resolve(result);
                })
        })
    }

    async saveRegistry(resp, key){
        return new Promise ((resolve, reject) => {
            db.put(key,resp,(err)=>{
                if (err){
                    reject(err);
                }
                resolve(resp);
            })
        })
    }

    async getLastKey(){
        return new Promise ((resolve,reject) =>{
            let i = 0;
            db.createReadStream()
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

    getTimeStamp(){
        return new Date().getTime().toString().slice(0,-3);
    }

    async validate(signature){
        let vald = new ValidationResponse(this.address);
        let lastKey = await this.getLastKey()
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

        let registry = await this.getRegistry(lastKey)
            .then(value => {
                return value;
            })
            .catch(err => {
                console.log(err);
                return 0;
            });

        //Validate Time Window
        let initTime = registry.requestTimeStamp;
        let finalTime = this.getTimeStamp();
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

        return vald;
    }

    getRegistry(key){
        return new Promise ((resolve,reject) => {
            db.get(key, (err, value) => {
                if (err){
                    reject(err);
                }
                resolve(value);
            })
        })
    }
}


module.exports = Validator;
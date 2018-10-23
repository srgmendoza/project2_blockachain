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
    }

    async starRegistry(){
        let resp = new MessageResponse(this.address);
        resp.requestTimeStamp = this.getTimeStamp();
        resp.message = resp.address + ':' + resp.requestTimeStamp + ':' + 'starRegistry';
        resp.validationWindow = 60; //Set to 300 Seg = 5min

        let key = await this.getLastKey()
            .then((value)=>{
                return value;
            })
            .catch((err)=>{
                console.log(err);
                return 0;
            });

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
            vald.status.validationWindow = registry.validationWindow;
            vald.status.messageSignature = "valid";
        }else{
            vald.registerStar = false;
            vald.status.address = registry.address;
            vald.status.requestTimeStamp = registry.requestTimeStamp;
            vald.status.message = registry.message;
            vald.status.validationWindow = registry.validationWindow;
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
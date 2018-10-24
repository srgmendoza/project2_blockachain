
//Registry Response Class
const RegistryResponse = require('./registryResp');
//Utils
const Utils = require("./utils");


class Registry{

    constructor(address){
        this.address = address;
    }

    async starRegistry(){

        //Get last inserted Key
        let key = await Utils.getLastKey()
            .then((value)=>{
                return value;
            })
            .catch((err)=>{
                console.log(err);
                return 0;
            });

        if(key > 0){
            let lastRegistry = await Utils.getRegistryByAddress(this.address)
                .then(value => {
                    return value;
                })
                .catch(err => {
                    console.log(err);
                    return 0;
                });

            let diff;
            if(lastRegistry.length > 0){
                diff = lastRegistry[0].validationWindow - (Utils.getTimeStamp() - lastRegistry[0].requestTimeStamp);
            }else{
                diff = 0;
            }

            if(lastRegistry.length > 0 && diff >= 0){
                if(lastRegistry[0].address == this.address){

                    lastRegistry[0].validationWindow =  diff;

                    console.log(JSON.stringify(lastRegistry[0]));
                    return lastRegistry[0];
                }else{
                    let resp = new RegistryResponse(this.address);
                    resp.requestTimeStamp = Utils.getTimeStamp();
                    resp.message = resp.address + ':' + resp.requestTimeStamp + ':' + 'starRegistry';
                    resp.validationWindow = Utils.timeWindow();

                    let savedObj = await Utils.saveRegistry(resp,key)
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
                let resp = new RegistryResponse(this.address);
                resp.requestTimeStamp = Utils.getTimeStamp();
                resp.message = resp.address + ':' + resp.requestTimeStamp + ':' + 'starRegistry';
                resp.validationWindow = Utils.timeWindow();

                let savedObj = await Utils.saveRegistry(resp,key)
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
            let resp = new RegistryResponse(this.address);
            resp.requestTimeStamp = Utils.getTimeStamp();
            resp.message = resp.address + ':' + resp.requestTimeStamp + ':' + 'starRegistry';
            resp.validationWindow = Utils.timeWindow(); //Set to 300 Seg = 5min

            let savedObj = await Utils.saveRegistry(resp,key)
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

}


module.exports = Registry;
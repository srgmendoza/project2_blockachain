
const Utils = require("./utils");
const Blockchain = require('./blockchain');
const Block = require('./block');
const Star = require('./star');
const Validation = require('./validationResp');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const Registry = require('./registry');
const ErrorLog = require('./errorLog');



//Post Block
app.use(bodyParser.text());
app.post('/block', jsonParser, async (req, res) => {
    if (!req.body ||
        (req.body.constructor === Object && Object.keys(req.body).length === 0)){
        return res.sendStatus(400);
    } else {
        console.log('Post Block ' + (JSON.stringify(req.body)) + ' Working');
        let star = new Star(req.body.star);
        if((star.dec != "" && star.ra != "" && star.story != "") && (star.dec != undefined && star.ra != undefined && star.story != undefined)){
            let bl = new Block(req.body.address,star);
            let bc = new Blockchain();
            let validation = await Utils.getValidation(req.body.address)
                .then(value =>{
                    return value;
                })
                .catch(err =>{
                    console.log(err);
                });
            console.log(validation[0]);
            if (validation[0].value.registerStar){
                let result = await bc.addBlock(bl);
                if (result){
                    let used = new Validation(req.body.address);
                    used.registerStar = false;
                    used.status = validation[0].value.status;
                    await Utils.setUsed(validation[0].key, used)
                        .then(value => {
                            console.log(value);
                        });
                }

                //Get Block Inserted
                await res.send(result);
            }else{
                await res.send(new ErrorLog(2))
            }
        }else{
            await res.send(new ErrorLog(1))
        }
    }
})

//Post Registry
app.use(bodyParser.text());
app.post('/requestValidation', jsonParser, async (req,res) => {
    let val = new Registry(req.body.address,"");
    let result = await val.starRegistry()
        .then(res=>{
            return res;
        })
        .catch(err=>{
            return err;
        });

    await res.send(result);
})

//Post Validate
app.use(bodyParser.text());
app.post('/message-signature/validate', jsonParser, async (req,res) => {
    let result = await Blockchain.validate(req.body.signature,req.body.address)
        .then(res=>{
            return res;
        })
        .catch(err=>{
            return err;
        });

    await res.send(result);
})

//Get Block by Height
app.get('/block/:id', async (req, res) => {
    try{
        console.log('Get Block ' + (req.params.id) + ' Working...')
        var bc = new Blockchain();
        var block = await Utils.getBlockByHeight(req.params.id)
            .then(value =>{
                //console.log(value);
                return value;
            })
            .catch(err=>{
                console.log(err);
                return res.sendStatus(404);
            });
        res.send(block);
    }catch(error){
        console.log(error);
    }
});

//Get Blocks by Address
app.get('/stars/address:address', async (req, res) => {
    try{
        //console.log('Get Block ' + (req.params.id) + ' Working...')
        var bc = new Blockchain();
        var block = await Utils.getBlockByAddress(req.params.address.replace(":",""))
            .then(value =>{
                //console.log(value);
                return value;
            })
            .catch(err=>{
                console.log(err);
                return res.sendStatus(404);
            });
        res.send(block);
    }catch(error){
        console.log(error);
    }
});

//Get Block by Hash
app.get('/stars/hash:hash', async (req, res) => {
    try{
        //console.log('Get Block ' + (req.params.id) + ' Working...')
        var bc = new Blockchain();
        var block = await Utils.getBlockByHash(req.params.hash.replace(":",""))
            .then(value =>{
                //console.log(value);
                return value;
            })
            .catch(err=>{
                console.log(err);
                return res.sendStatus(404);
            });
        res.send(block);
    }catch(error){
        console.log(error);
    }
});

app.listen(8000, () => console.log('Example app listening on port 8000!'))
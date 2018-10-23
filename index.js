const Blockchain = require('./simpleChain');
const Block = require('./block');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const Validator = require('./validator');

//Post Block
app.use(bodyParser.text());
app.post('/block', jsonParser, async function (req, res) {
    if (!req.body ||
        (req.body.constructor === Object && Object.keys(req.body).length === 0)){
        return res.sendStatus(400);
    } else {
        console.log('Post Block ' + (JSON.stringify(req.body)) + ' Working');
        var bl = new Block(req.body.address,req.body.star);
        var bc = new Blockchain();
        let result = await bc.addBlock(bl)

        //Get Block Inserted
        await res.send(result);
    }
})

//Post Registry
app.use(bodyParser.text());
app.post('/requestValidation', jsonParser, async (req,res) => {
    let val = new Validator(req.body.address,"");
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
    let val = new Validator(req.body.address);
    let result = await val.validate(req.body.signature)
        .then(res=>{
            return res;
        })
        .catch(err=>{
            return err;
        });

    await res.send(result);
})

//Get Block by Height
app.get('/block/:id', async function (req, res) {
    try{
        console.log('Get Block ' + (req.params.id) + ' Working...')
        var bc = new Blockchain();
        var block = await bc.getBlockByHeight(req.params.id)
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
        var block = await bc.getBlockByAddress(req.params.address.replace(":",""))
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
        var block = await bc.getBlockByHash(req.params.hash.replace(":",""))
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
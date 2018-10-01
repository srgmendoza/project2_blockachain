const Blockchain = require('./simpleChain');
const Block = require('./block');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

app.get('/block/:id', async function (req, res) {
    try{
        console.log('Get Block ' + (req.params.id) + ' Working...')
        var bc = new Blockchain();
        var block = await bc.getBlock(req.params.id)
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

app.use(bodyParser.text());
app.post('/block', jsonParser, async function (req, res) {
    if (!req.body || 
        (req.body.constructor === Object && Object.keys(req.body).length === 0)){
        return res.sendStatus(400);
    } else {
        console.log('Post Block ' + (JSON.stringify(req.body)) + ' Working');
        var bl = new Block(req.body.body);
        var bc = new Blockchain();
        let result = await bc.addBlock(bl)
        
        //Get Block Inserted
        await res.send(result);
    }
})

app.listen(8000, () => console.log('Example app listening on port 8000!'))
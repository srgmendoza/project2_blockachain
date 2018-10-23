# RESTFul Web API With ExpresJS Framework

3rd Project of Udacity Blockchain Nanodegree

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm init
```
- Install crypto-js with --save flag to save dependency to our package.json file
```
npm install crypto-js --save
```
- Install level with --save flag
```
npm install level --save
```
- Install Express JS Framework
```
npm install express --save
```
- Install Express JS Framework Parser
```
npm install body-parser
```
- Install Bitcoin JS Message
```
npm npm i bitcoinjs-message
```


## Testing

This project have 2 endpoints listening in port 8000

###POST Methods
####localhost:8000/requestValidation
Start initial validation routine

```
POST /block HTTP/1.1
Host: localhost:8000
Cache-Control: no-cache

{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"
}
```

####localhost:8000/message-signature/validate
Confirm validation routine, requires to be done into the configured time windows 
(By Default 5 minutes), since the start has begun

```
POST /block HTTP/1.1
Host: localhost:8000
Cache-Control: no-cache

{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "signature": "H6ZrGrF0Y4rMGBMRT2+hHWGbThTIyhBS0dNKQRov9Yg6GgXcHxtO9GJN4nwD2yNXpnXHTWU9i+qdw5vpsooryLU="
}
```

####localhost:8000/block/
Stores a new block with the info of a new star into the blockchain, 
and retrieves the new block with its info in JSON format

The request body should be string formatted and must look like this

```
POST /block HTTP/1.1
Host: localhost:8000
Cache-Control: no-cache

{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "star": {
    "dec": "-26° 29'\'' 24.9",
    "ra": "16h 29m 1.0s",
    "story": "Found star using https://www.google.com/sky/"
}
```


###GET Methods
####localhost:8000/block/:id
Get Block by id / height given

```
GET request using CURL

curl "http://localhost:8000/block/1"
```
####localhost:8000/stars/address:[ADDRESS]
Get Block by Wallet Address

```
GET request using CURL

curl "http://localhost:8000/stars/address:142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"
```

####localhost:8000/stars/hash:[HASH]
Get Block by hash

```
GET request using CURL

curl "http://localhost:8000/stars/hash:a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f"
```



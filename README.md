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

## Testing

To test:

This project have 2 endpoints listening in port 8000

Method: GET
localhost:8000/block/[blockHeight]
Retrieves the information for the given block height.

Method POST
localhost:8000/block/
Stores a new block into the blockchain, and retrieves the new block with its info in JSON format

The request body should be string formatted and must look like this

```
POST /block HTTP/1.1
Host: localhost:8000
Cache-Control: no-cache

{
  "body": "Testing block with test string data"
}
```

`# project3_blockachain
# project3_blockachain

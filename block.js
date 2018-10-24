const Star = require("./star");

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
    constructor(address,star){
        this.hash = "",
            this.height = 0,
            this.body = new Body(address,star),
            this.time = 0,
            this.previousBlockHash = ""
    }
}

class Body{
    constructor(address,star){
        this.address = address,
            this.star = new Star(star)
    }
}




module.exports = Block;

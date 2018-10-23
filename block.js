

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

class Star{
    constructor(star){
        this.ra = star.ra,
            this.dec = star.dec,
            this.mag = "",
            this.const = "",
            this.story = Buffer.from(truncate(star.story,250), 'ascii').toString('hex');
    }
}

function truncate(textToLimit, wordLimit)
{
    let finalText = "";
    let text2 = textToLimit.replace(/\s+/g, ' ');
    let text3 = text2.split(' ');
    let numberOfWords = text3.length;
    let i=0;

    if(numberOfWords > wordLimit) {
        for(i=0; i< wordLimit; i++)
            finalText = finalText+" "+ text3[i]+" ";
        console.log(finalText);
        return finalText+"...";
    }
    else{
        return textToLimit;
    }
}

module.exports = Block;
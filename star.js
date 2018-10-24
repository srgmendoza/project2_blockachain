class Star{
    constructor(star){
        this.ra = star.ra,
            this.dec = star.dec,
            this.mag = star.mag,
            this.constl = star.constl,
            this.story = Buffer.from(truncate(star.story,250), 'ascii').toString('hex');
        this.storyDecoded = star.storyDecoded;
    }
}


function truncate(textToLimit, wordLimit)
{
    if(textToLimit){
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
    }else{
        return "";
    }

}

module.exports = Star;
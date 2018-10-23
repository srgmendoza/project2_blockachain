/* ===== response Class ==============================
|  Class with a constructor for initial Response      |
|  ==================================================*/

class MessageResp{
    constructor(address){
        this.address = address,
            this.requestTimeStamp = '',
            this.message = '',
            this.validationWindow = 0
    }
}

module.exports = MessageResp;
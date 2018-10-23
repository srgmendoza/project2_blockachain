/* ===== response Class ==============================
|  Class with a constructor for initial Response      |
|  ==================================================*/

class ValidationResponse{
    constructor(address){
        this.registerStar = false;
        this.status = new Status(address);
    }
}

class Status {
    constructor(address){
        this.address = address,
            this.requestTimeStamp = '',
            this.message = '',
            this.validationWindow = 0,
            this.messageSignature = ""
    }
}

module.exports = ValidationResponse;
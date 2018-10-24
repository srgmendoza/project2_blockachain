class ErrorLog{
    constructor(type){
        this.errorType = type,
            this.description = getType(type);
    }
}

function getType (type){
    switch (type) {
        case 1:
            return "Incomplete Arguments"
        break;
        case 2:
            return "Signature valid just for one star register, must start validation process again at http://localhost:8000/requestValidation"
        break;
        default:
            return "Not Defined Error"
    }
}

module.exports = ErrorLog;
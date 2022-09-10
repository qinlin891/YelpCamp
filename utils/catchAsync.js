//returns the passed function if no error or pass to the next error-handing middleware
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}
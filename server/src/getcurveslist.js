module.exports = function(dataStorage) {
    return function(req, res, next) {
        if (!req.body) {
            res.status(400);
            return res.json('Get curves list error');
        }
        var testData = dataStorage.getCurvesList();
        res.status(200);
        res.json({'data': testData});
    };
};

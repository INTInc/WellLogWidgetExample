
module.exports = function (dataStorage) {
    return function (req, res, next) {
        if (!req.body) {
            res.status(400);
            return res.json('Get data error');
        }
        var curves = req.body.curves;
        var range = req.body.range;
        var scale = req.body.scale;
        var useDecimation = req.body.usedecimation;
        var testData = dataStorage.getTestData(curves, range, scale, useDecimation);
        res.status(200);
        res.json(testData);
    };
};

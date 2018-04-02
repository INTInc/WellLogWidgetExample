module.exports = function(dataStorage) {
    return function(req, res, next) {
        if (!req.params.id || !(typeof req.params.id === 'string')) {
            res.status(400);
            return res.json('Param id is missing');
        }
        var curveId = req.params.id;
        var minMax = dataStorage.getCurveMinMax(curveId);
        res.status(200);
        res.json(minMax);
    };
};

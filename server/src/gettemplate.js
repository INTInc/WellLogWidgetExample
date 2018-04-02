var fs = require('fs');

module.exports = function () {
    return function (req, res, next) {
        var path = './server/data/';
        var fileId = req.params.id;
        if (!fileId) {
            res.status(400);
            return res.json('Get data error');
        }
        fs.readFile(path + fileId, function (error, data) {
            if (error) {
                res.status(400);
                return res.json('Get data error');
            }
            res.status(200);
            res.json(JSON.parse(data));
        });
    };
};

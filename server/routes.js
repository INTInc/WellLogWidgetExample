var express = require('express');
var router = express.Router();
var GetCurvesData = require('./src/getcurvesdata');
var GetCurvesList = require('./src/getcurveslist');
var GetCurvesMetaData = require('./src/getcurvemetadata');
var GetCurveMinMax = require('./src/getcurveminmax');
var DataStorage = require('./data/datastorage')();
var GetTemplate = require('./src/gettemplate');
var dataStorage = new DataStorage();

module.exports = function (app) {
    // Curves
    router.post('/v1/curves/data', GetCurvesData(dataStorage));
    router.get('/v1/curves', GetCurvesList(dataStorage));
    router.get('/v1/curves/:id', GetCurvesMetaData(dataStorage));
    router.get('/v1/curves/:id/range', GetCurveMinMax(dataStorage));
    // Templates
    router.get('/v1/templates/:id', GetTemplate());
    return router;
};

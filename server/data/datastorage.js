var curves = require('./data');
module.exports = function() {
    var stepDistance = 10;
    var minDistance = 0.5; // a half pixel
    var minTVDSS = 1000;
    var tracksCount = 300;
    var stepTVDSS = 10;
    var samplesCount = 1000;
    var maxTVDSS = minTVDSS + tracksCount * stepTVDSS;
    var Range = function(low, high) {
        this._low = low;
        this._high = high;
    };
    Range.prototype.getLow = function() {
        return this._low;
    };
    Range.prototype.getHigh = function() {
        return this._high;
    };
    Range.prototype.getSize = function() {
        return this._high - this._low;
    };

    function getTVDSSValue (i) {
        var n = tracksCount;
        var maxTVDSS = minTVDSS + tracksCount * stepTVDSS;
        var amp = (maxTVDSS - minTVDSS) / 2;
        var beta = 2.0 / n;
        return Math.abs((amp * Math.exp(-beta * i)));
    }

    // TODO: Simple stupid implementation
    var DataStorage = function() {
        this.range = new Range(minTVDSS, maxTVDSS);
        var depthStep = (maxTVDSS - minTVDSS) / samplesCount;
        this.logData = DataStorage.genenerateLogData(this.range, depthStep);
    };
    DataStorage.genenerateLogData = function(range, step) {
        var data = {
            'Depth': {'type': 'number', 'unit': 'ft', 'data': []},
            'GR': {'type': 'number', 'unit': 'API(Remote)', 'data': []},
            'RHOB': {'type': 'number', 'unit': 'G/CC(Remote)', 'data': []}
        };
        var depth = range.getLow();
        var samplesCount = Math.ceil(range.getSize() / step);
        var gr = curves.getCurveData('GR');
        var rhob = curves.getCurveData('RHOB');
        var size = Math.min(gr.length, rhob.length);
        var index = 0;
        for (var i = 0; i < samplesCount; ++i) {
            data['Depth']['data'][i] = depth;
            data['GR']['data'][i] = gr[index];
            data['RHOB']['data'][i] = rhob[index];
            depth += step;
            index++;
            if (index >= size) {
                index = 0;
            }
        }
        return data;
    };
    DataStorage.prototype.getCurveMinMax = function(curveId) {
        var curve = this.logData[curveId];
        if (curve) {
            var result = {
                'name': curveId,
                'min': Math.min.apply(null, this.logData[curveId]['data']),
                'max': Math.max.apply(null, this.logData[curveId]['data'])
            };
            return result;
        }
        return {'name': curveId, 'min': NaN, 'max': NaN};
    };
    DataStorage.prototype.getCurveMetaData = function(curveId) {
        var curve = this.logData[curveId];
        curve = curve || this.sectionData[curveId];
        if (curve) {
            var result = {
                'name': curveId
            };
            for (var prop in curve) {
                if (curve.hasOwnProperty(prop) && prop !== 'data') {
                    result[prop] = curve[prop];
                }
            }
            return result;
        }
        return {'name': curveId};
    };
    DataStorage.prototype.getCurvesList = function() {
        return [
            {'name': 'Depth', 'type': 'number', 'unit': 'ft'},
            {'name': 'GR', 'type': 'number', 'unit': 'API'},
            {'name': 'RHOB', 'type': 'number', 'unit': 'G/CC'}
        ];
    };
    DataStorage.prototype.getLogData = function (curves, range, scale, usedecimation) {
        scale = scale || 1;
        usedecimation = !!usedecimation;
        var wholeRange = this.range;
        var requestedRange = !range ? this.range : new Range(range['min'], range['max']);
        var depthsSeries = this.logData['Depth']['data'];
        var numberOfSamples = depthsSeries.length;
        var originalStep = Math.ceil(wholeRange.getSize() / numberOfSamples);
        var span = requestedRange.getSize() / 20;
        var startDepth = Math.max(requestedRange.getLow() - span, wholeRange.getLow());
        var endDepth = Math.min(requestedRange.getHigh() + span, wholeRange.getHigh());
        var startIndex = Math.floor((startDepth - wholeRange.getLow()) / originalStep);
        if (startIndex < 0) {
            startIndex = 0;
        }
        var endIndex = Math.ceil((endDepth - wholeRange.getLow()) / originalStep);
        // distance between samples in device
        var step = Math.ceil((minDistance / scale) / originalStep);
        if (step <= 0) {
            step = 1;
        }
        if (usedecimation === false) {
            step = 1;
        }
        startIndex = step * Math.floor(startIndex / step);
        endIndex = step * Math.ceil(endIndex / step);
        if (endIndex >= numberOfSamples) {
            endIndex = numberOfSamples - 1;
        }
        var cells = [], i, j, k;
        var curvesCount = curves.length;
        var curvesData = [];
        for (i = 0; i < curvesCount; ++i) {
            cells[i] = [];
            curvesData[i] = this.logData[curves[i]]['data'];
        }
        k = 0;
        for (i = startIndex; i <= endIndex; i = i + step) {
            for (j = 0; j < curvesCount; ++j) {
                cells[j][k] = curvesData[j][i];
            }
            k++;
        }
        return cells;
    };
    DataStorage.prototype.getTestData = function(curves, range, scale, usedecimation) {
        return this.getLogData(curves, range, scale, usedecimation);
    };

    return DataStorage;
}

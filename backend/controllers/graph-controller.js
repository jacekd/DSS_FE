(function(){

    'use strict';

    var Foxx            = require('org/arangodb/foxx'),
        controller      = new Foxx.Controller(applicationContext),
        arango          = require('org/arangodb'),
        db              = arango.db,
        console         = require("console");

    /** Retrieves potential risks connected to TOIA or BSOIA assets.
     *
     */
    controller.get('potentialRisks', function(req, res){

        //TODO: Return projections and not full paths?
        var query = 'for p in graph_paths("dss", {direction: "outbound", followCycles: false, minLength: 1, maxLength: 2})' +
            'let sourceType = (p.source.type)' +
            'let destinationType = (p.destination.type)' +
            'let sourceName = (lower(p.source.name))' +
            'filter ((sourceType == "bsoia" || sourceType == "toia") && (destinationType == "risk") && (contains(lower(@bsoias), sourceName) || contains(lower(@toias), sourceName)))' +
            'return p';

        var stmt = db._createStatement({query: query});

        var bsoias = '';
        var toias = '';

        if(req.params('bsoias') !== null && typeof req.params('bsoias') !== 'undefined'){
            bsoias = req.params('bsoias');
        }
        stmt.bind('bsoias', bsoias);

        if(req.params('toias') !== null && typeof req.params('toias') !== 'undefined'){
            toias = req.params('toias');
        }
        stmt.bind('toias', toias);

        var result = stmt.execute();
        res.json(result);

    }).queryParam('bsoias', {
        description: 'A comma-separated list of selected BSOIA assets names',
        type: 'string',
        required: false
    }).queryParam('toias', {
        description: 'A comma-separated list of selected TOIA assets names',
        type: 'string',
        required: false
    });

    /**
     * Retrieves treatments connected to risks.
     */
    controller.get('potentialTreatments', function(req, res){

        //TODO: Return projections and not full paths?
        var query = 'for p in graph_paths("dss", {direction: "outbound", followCycles: false, minLength: 1, maxLength: 1})' +
            'let sourceType = (p.source.type)' +
            'let destinationType = (p.destination.type)' +
            'let sourceName = (lower(p.source.name))' +
            'filter (sourceType == "risk") && (destinationType == "treatment") && (contains(lower(@risks), sourceName))' +
            'return p';

        var stmt = db._createStatement({query: query});

        var risks = '';

        if(req.params('risks') !== null && typeof req.params('risks') !== 'undefined'){
            risks = req.params('risks');
        }

        stmt.bind('risks', risks);

        var result = stmt.execute();
        res.json(result);

    }).queryParam('risks', {
        description: 'A comma-separated list of selected risks names',
        type: 'string',
        required: false
    });

    /**
     * Updates a metric edge value and updates the graph properly
     */
    controller.put('updateMetric', function(req, res){

        var metricName = req.params('metricName');
        var serviceName = req.params('serviceName');

        var newValue = req.body().newValue;

        var result = db._executeTransaction({
            collections: {
                write: ['edges', 'metric', 'service', 'characteristic']
            },
            action: function(params){

                var db = require('internal').db;
                var console = require('console');
                var _ = require('underscore');

                var metricName = params[0];
                var serviceName = params[1];

                var newValue = params[2];

                console.info('Starting update process on metric ' + metricName + ' for service ' + serviceName + ' with new value ' + newValue);

                // Update metric - service edge with new value
                var query = 'for edge in dss::graph::serviceEdgeFromMetric(@metricName, @serviceName)' +
                            'update edge with {"value": @newValue} in edges';

                var stmt = db._createStatement({query: query});
                stmt.bind('metricName', metricName);
                stmt.bind('serviceName', serviceName);
                stmt.bind('newValue', newValue);
                stmt.execute();

                // Recompute affected characteristic - service edges values

                // 1) Grab characteristic nodes connected to the metric
                var query = 'for node in dss::graph::characteristicNodesFromMetric(@metricName) return node';
                var stmt = db._createStatement({query: query});
                stmt.bind('metricName', metricName);
                var characteristics = stmt.execute()._documents;

                // 2) Compute formula value for each characteristic and update characteristic - service edge
                _.each(characteristics, function(characteristic){
                    var characteristicName = characteristic.name;
                    var characteristicFormula = eval(characteristic.formula);
                    console.info('Characteristic formula', characteristicFormula);
                    var characteristicFunction = Function.apply(null, characteristicFormula);
                    var newValue = characteristicFunction(serviceName);
                    console.info('Computed value', newValue);
                    var query = 'for edge in dss::graph::serviceEdgeFromCharacteristic(@characteristicName, @serviceName)' +
                                'update edge with {"value": @newValue} in edges';
                    var stmt = db._createStatement({query: query});
                    stmt.bind('characteristicName', characteristicName);
                    stmt.bind('serviceName', serviceName);
                    stmt.bind('newValue', newValue);
                    stmt.execute();
                });

                return {error: false};

            },
            params: [metricName, serviceName, newValue],
            waitForSync: false
        });

        res.json(result);

    }).queryParam('metricName', {
        descripton: 'A valid metric node name',
        type: 'string',
        required: true
    }).queryParam('serviceName', {
        description: 'A valid service node name',
        type: 'string',
        required: true
    });

    /**
     * Services lookup endpoint
     */
    controller.get('lookupServices', function(req, res){
        var cloudType = req.params('cloudType');
        var treatmentsList = req.params('treatments').split(',');

        if(cloudType && treatmentsList){
            if(treatmentsList.length == 0){
                res.json({error: true, reason: 'Treatments names list can\'t be empty'});
            } else {
                var query = 'for result in dss::graph::lookupServices(@cloudType, @treatmentsList) return result';
                var stmt = db._createStatement({query: query});
                stmt.bind('cloudType', cloudType);
                stmt.bind('treatmentsList', treatmentsList);
                var result = stmt.execute();
                res.json(result);
            }
        } else {
            if(!cloudType){
                res.json({error: true, reason: 'Invalid cloud type (must be a value between ["Paas", "IaaS", "SaaS"'});
            } else if(!treatmentsList){
                res.json({error: true, reason: 'Provided treatments list is not valid'});
            }
        }
    }).queryParam('cloudType', {
        description: 'Type of cloud (PaaS|IaaS|SaaS)',
        type: 'string',
        required: true
    }).queryParam('treatments', {
        description: 'A comma-separated list of treatments names values',
        type: 'string',
        required: true
    });

})();
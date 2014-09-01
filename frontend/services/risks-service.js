/**
 * Created by Jordi Aranda.
 * 17/07/14
 * <jordi.aranda@bsc.es>
 */

dssApp.service('RisksService', ['flash', 'localStorageService', function(flash, localStorageService){

    var risks = [];

    var risksLikelihoodConsequenceFromStorage = localStorageService.get('simpleRisksLikelihoodConsequence');
    var risksLikelihoodConsequence = (!_.isNull(risksLikelihoodConsequenceFromStorage)) ? risksLikelihoodConsequenceFromStorage : {};           //Likelihood/consequences values for each risk (as a whole) of the form
                                                                                                                                                //riskname_likelihood/riskname_consequence

    var risksTALikelihoodConsequenceFromStorage = localStorageService.get('multipleRisksLikelihoodConsequence');
    var risksTALikelihoodConsequence = (!_.isNull(risksTALikelihoodConsequenceFromStorage)) ? risksTALikelihoodConsequenceFromStorage : {};     //Likelihood/consequences values for each TA and risk of the form
                                                                                                                                                //riskname_taAssetName_likelihood/riskname_taAssetName_consequence

    var loadingDataFromLocalStorage = false;                                                                                                    //Flag to control local storage restore state

    /**
     * Adds a risk to the list of selected risks.
     * @param risk The risk to be added.
     */
    this.addRisk = function(risk){
        if(risk === null || typeof risk === 'undefined'){
            flash.warn = 'No risk was selected';
        } else {
            //Check risk doesn't already exist
            var exists = risks.filter(function(r, riskIndex){
                return risk.destination.name == r.destination.name;
            }).length > 0;
            if(!exists){
                risks.push(risk);
            } else {
                flash.warn = 'This risk has been already added';
            }
        }
    };

    /**
     * Removes a risk from the list of selected risks.
     * @param risk The risk to be removed.
     */
    this.removeRisk = function(risk){
        var index = -1;
        _.each(risks, function(r, riskIndex){
            if(risk.destination.name == r.destination.name){
                index = riskIndex;
            }
        });
        if(index >= 0) risks.splice(index, 1);
    };

    /**
     * Retrieves the list of selected risks.
     * @returns {Array}
     */
    this.getRisks = function(){
        return risks;
    };

    /**
     * Adds a new risk likelihood value for a given risk.
     * @param riskName The risk name.
     * @param likelihood The likelihood value of that risk.
     */
    this.addRiskLikelihood = function(riskName, likelihood){
        //console.log('adding risk likelihood in ' + riskName);
        risksLikelihoodConsequence[riskName + '_likelihood'] = parseInt(likelihood);
    };

    /**
     * Removes likelihood/consequence values for a given risk.
     * This implies clearing both simple and multiple models.
     * @param riskName The risk name.
     */
    this.removeRiskLikelihoodConsequence = function(riskName){
        //clear simple/multiple model
        var regex = new RegExp(riskName + '[\\w\\s]*', 'i');
        for(key in risksLikelihoodConsequence){
            if(regex.exec(key)){
                //console.log('removing key ' + key + ' in simple model');
                delete risksLikelihoodConsequence[key];
            }
        }
        for(key in risksTALikelihoodConsequence){
            if(regex.exec(key)){
                //console.log('removing key ' + key + ' in multiple model');
                delete risksTALikelihoodConsequence[key];
            }
        }
    };

    /**
     * Adds a new consequence value for a given risk.
     * @param riskName The risk name.
     * @param consequence The consequence value of that risk.
     */
    this.addRiskConsequence = function(riskName, consequence){
        //console.log('adding risk consequence for ' + riskName + ' in simple model');
        risksLikelihoodConsequence[riskName + '_consequence'] = parseInt(consequence);
    };

    /**
     * Adds a new likelihood value for a given tangible asset risk.
     * @param riskName The risk name.
     * @param taAssetName The tangible asset name.
     * @param likelihood The likelihood value.
     */
    this.addRiskTALikelihood = function(riskName, taAssetName, likelihood){
        //console.log('adding risk likelihood for ' + riskName + '/' + taAssetName + ' in multiple model');
        risksTALikelihoodConsequence[riskName + '_' + taAssetName + '_likelihood'] = parseInt(likelihood);
    };

    /**
     * Adds a new consequence value for a given tangible asset risk.
     * @param riskName The risk name.
     * @param taAssetName The tangible asset name.
     * @param consequence The consequence value.
     */
    this.addRiskTAConsequence = function(riskName, taAssetName, consequence){
        //console.log('adding risk consequence for ' + riskName + '/' + taAssetName + ' in multiple model');
        risksTALikelihoodConsequence[riskName + '_' + taAssetName + '_consequence'] = parseInt(consequence);
    };

    /**
     * Removes both likelihood/consequence values for a given tangible asset risk.
     * @param taAssetName The tangible asset name.
     */
    this.removeRiskTALikelihoodConsequence = function(taAssetName){
        //clear multiple model
        var regex = new RegExp('[\\w\\s]+_' + taAssetName + '_[\\w\\s]+', 'i');
        for(key in risksTALikelihoodConsequence){
            if(regex.exec(key)){
                //console.log('removing key ' + key + ' in multiple model');
                delete risksTALikelihoodConsequence[key];
            }
        }
    };

    /**
     * Retrieves the simple model risk values (likelihood and consequence).
     * @returns {{}}
     */
    this.getRisksLikelihoodConsequence = function(){
        return risksLikelihoodConsequence;
    };

    /**
     * Retrieves the multiple model risk values (likelihood and consequence).
     * @returns {{}}
     */
    this.getRisksTALikelihoodConsequence = function(){
        return risksTALikelihoodConsequence;
    };

    /**
     * Sets the risks to that ones loaded from local storage.
     * @param risksLoadedFromLocalStorage Local storage risks.
     */
    this.setRisks = function(risksLoadedFromLocalStorage){
        risks = risksLoadedFromLocalStorage;
    };

    /**
     * Sets the simple risk model to that one loaded from local storage.
     * @param simpleRisksLikelihoodConsequenceLoadedFromLocalStorage Local
     * storage simple risk model.
     */
    this.setSimpleRisksLikelihoodConsequence = function(simpleRisksLikelihoodConsequenceLoadedFromLocalStorage){
        risksLikelihoodConsequence = simpleRisksLikelihoodConsequenceLoadedFromLocalStorage;
    };

    /**
     * Sets the multiple risk model to that one loaded from local storage.
     * @param multipleRisksLikelihoodConsequenceLoadedFromLocalStorage Local
     * storage multiple risk model.
     */
    this.setMultipleRisksLikelihoodConsequence = function(multipleRisksLikelihoodConsequenceLoadedFromLocalStorage){
        risksTALikelihoodConsequence = multipleRisksLikelihoodConsequenceLoadedFromLocalStorage;
    };

    /**
     * Sets a flag indicating local storage data is being loaded.
     * @param loading A boolean indicating the loading state.
     */
    this.loadingLocalStorageData = function(loading){
        loadingDataFromLocalStorage = loading;
    }

    /**
     * Whether local storage data is being loaded or not.
     * @returns {boolean}
     */
    this.isLoadingLocalStorageData = function(){
        return loadingDataFromLocalStorage;
    }

}]);
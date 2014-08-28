/**
 * Created by Jordi Aranda.
 * 22/07/14
 * <jordi.aranda@bsc.es>
 */

dssApp.service('TreatmentsService', ['flash', 'localStorageService', function(flash, localStorageService){

    var treatmentsFromStorage = localStorageService.get('treatmentsSelected');
    var treatments = (!_.isNull(treatmentsFromStorage)) ? treatmentsFromStorage : [];
    var treatmentsValuesFromStorage = localStorageService.get('treatmentValues');
    var treatmentsValues = (!_.isNull(treatmentsValuesFromStorage)) ? treatmentsValuesFromStorage : {};      // Treatments values model used to store select/sliders/radio UI components values

    /**
     * Adds a treatment to the list of selected treatments.
     * @param risk The treatment to be added.
     */
    this.addTreatment = function(treatment){
        if(treatment === null || typeof treatment === 'undefined'){
            flash.warn = 'No treatment was selected';
        } else {
            //Check treatment doesn't already exist
            var exists = treatments.filter(function(t, treatmentIndex){
                return treatment.destination.name == t.destination.name;
            }).length > 0;
            if(!exists){
                treatments.push(treatment);
            } else {
                flash.warn = 'This treatment has been already added';
            }
        }
    };

    /**
     * Removes a treatment from the list of selected treatments.
     * @param risk The treatment to be removed.
     */
    this.removeTreatment = function(treatment){
        var index = -1;
        _.each(treatments, function(t, treatmentIndex){
            if(treatment.destination.name == t.destination.name){
                index = treatmentIndex;
            }
        });
        if(index >= 0) treatments.splice(index, 1);
    };

    /**
     * Retrieves the list of selected treatments.
     * @returns {Array}
     */
    this.getTreatments = function(){
        return treatments;
    };

    /**
     * Adds a new treatment value to the model of selected treatments values.
     * @param treatmentName The treatment name.
     * @param treatmentValue The treatment value.
     */
    this.addTreatmentValue = function(treatmentName, treatmentValue){
        console.log('adding treatment value', treatmentName, treatmentValue);
        treatmentsValues[treatmentName] = treatmentValue;
    };

    /**
     * Removes a treatment value from the model of selected treatments values.
     * @param treatmentName The treatment name.
     */
    this.removeTreatmentValue = function(treatmentName){
        console.log('removing treatment value', treatmentName);
        delete treatmentsValues[treatmentName];
    };

    /**
     * Retrieves the treatments values model.
     * @returns {{}}
     */
    this.getTreatmentsValues = function(){
        return treatmentsValues;
    }

    /**
     * check if TA exists in the treatment
     * @param treatment
     * @param ta
     * @returns {boolean}
     */
    this.taAssetExists = function (treatment, ta) {
        if (_.isUndefined(treatment.taRelations)) return false;
        return (_.indexOf(treatment.taRelations, ta) > -1);
    };

    /**
     * Add TA to Treatment
     * @param treatment
     * @param ta
     */
    this.addTAToTreatment = function (treatment, ta) {
        if (_.isUndefined(treatment.taRelations)) treatment.taRelations = [];
        treatment.taRelations.push(ta);
    };

    /**
     * Remove Tangible Asset from Treatment
     * @param treatment
     * @param ta
     * @returns {boolean}
     */
    this.removeTaFromTreatment = function (treatment, ta) {
        if (_.isUndefined(treatment.taRelations)) return false;
        var taPos = _.indexOf(treatment.taRelations, ta);
        if (taPos > -1) {
            treatment.taRelations.splice(taPos, 1);
            return;
        }
    };

}]);

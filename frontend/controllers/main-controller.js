/**
 * Created by Jordi Aranda.
 * 07/07/14
 * <jordi.aranda@bsc.es>
 */

dssApp.controller('mainController', ['$scope', '$rootScope', '$upload', 'flash', '$http', '$q', 'localStorageService', 'AssetsService', 'RisksService', 'TreatmentsService', 'ArangoDBService', '$timeout'
    , function($scope, $rootScope, $upload, flash, $http, $q, localStorageService, AssetsService, RisksService, TreatmentsService, ArangoDBService, $timeout){

    //Initialization

    //File Reader object
    var fileReader = new FileReader();
    //XML parser
    var x2js = new X2JS();
    //Last requirements loaded (string XML)
    var lastRequirementsLoaded = "";
    $scope.xmlAsJsonObject = AssetsService.getXmlTaObject();
    localStorageService.bind($scope, 'xmlAsJsonObject', $scope.xmlAsJsonObject);

    // Save loaded XML file name for later reuse on export
    $scope.xmlTaAssetsFileName = "";
    localStorageService.bind($scope, 'xmlTaAssetsFileName', $scope.xmlTaAssetsFileName);

    /**
     * Clear local storage and reload the window
     */
    $scope.clearSelection = function () {
        localStorageService.clearAll();
        window.location.reload();
    };

    /**
     * Saves the current user session (local storage values) on a file.
     * @param event
     */
    $scope.saveSessionFile = function (event) {
        var element = angular.element(event.target);

        var localStorageContent = {};
        var localStorageKeys = localStorageService.keys();
        _.each(localStorageKeys, function (key) {
            localStorageContent[key] = localStorageService.get(key);
        });

        element.attr({
            download: 'DSS_Session.json',
            href: 'data:application/json;charset=utf-8,' + encodeURI(JSON.stringify(localStorageContent)),
            target: '_blank'
        });
    };

    $scope.uploadSessionFile = function () {
        $('#uploadSessionFile').trigger('click');
    };

    //Force file upload dialog showing on input fields of type file
    $scope.showFileUploadDialog = function(inputId){
        $(inputId).trigger('click');
    };

    /********************* DSS CLOUD RESOURCE FILE UPLOAD *******************
    *************************************************************************
    ************************************************************************/

    $scope.onDSSCloudResourceFileSelect = function($files){

        var file = $files[0];
        $scope.xmlTaAssetsFileName = file.name;
        if(file !== null && typeof file !== 'undefined'){
            readFile(file).then(function(xmlString){
                //Check if XML document is correct using the XSD schema validation service on server-side
                ArangoDBService.validateSchema(xmlString, function(error, data){
                    if(error){
                        flash.error = 'Some error occurred while trying to upload your requirements';
                    } else {
                        if(data.correct){
                            $scope.xmlAsJsonObject = x2js.xml_str2json(xmlString);
                            AssetsService.setXmlTaObject($scope.xmlAsJsonObject);

                            var resources = $scope.xmlAsJsonObject.resourceModelExtension.resourceContainer;
                            _.each(resources, function(resource){
                                // IaaS
                                if(resource.hasOwnProperty('cloudResource')){
                                    resource.cloudType = 'IaaS';
                                }
                                // PaaS
                                else if(resource.hasOwnProperty('cloudPlatform')){
                                    resource.cloudType = 'PaaS';
                                }
                                AssetsService.addTA(resource);
                            });
                            $rootScope.$broadcast('loadedTA');
                        } else {
                            flash.error = 'Some error occurred while trying to upload your requirements';
                        }
                    }
                });
            });
        } else {
            flash.error = 'Some error occurred while trying to upload your requirements';
        }

        // Mind the hack! Reset the form so that cloud descriptor files (same name, file, ...)
        // can be uploaded first (wrap the input element within a form element and reset the form)
        jQuery('#cloud-descriptor-file-selector').get(0).reset();

    };

    /************************ USER SESSION FILE UPLOAD ***********************
     *************************************************************************
     ************************************************************************/

    $scope.onSessionFileSelect = function($files){
        var file = $files[0];
        $scope.xmlTaAssetsFileName = file.name;
        if(file !== null && typeof file !== 'undefined'){
            readFile(file).then(function(jsonString){
                var localStorageValues = JSON.parse(jsonString);
                // Don't touch this, order matters!
                AssetsService.loadingLocalStorageData(true);
                RisksService.loadingLocalStorageData(true);
                TreatmentsService.loadingTreatmentsFromLocalStorage(true);
                TreatmentsService.loadingTreatmentsValuesFromLocalStorage(true);
                AssetsService.setBSOIA(localStorageValues.bsoiaAssetsSelected);
                AssetsService.setTOIA(localStorageValues.toiaAssetsSelected);
                RisksService.setSimpleRisksLikelihoodConsequence(localStorageValues.simpleRisksLikelihoodConsequence);
                RisksService.setRiskBoundModels(localStorageValues.riskBoundModels);
                RisksService.setMultipleRisksLikelihoodConsequence(localStorageValues.multipleRisksLikelihoodConsequence);
                RisksService.setRisks(localStorageValues.risksSelected);
                AssetsService.setCriticityBoundModels(localStorageValues.criticityBoundModels);
                AssetsService.setTA(localStorageValues.taAssets);

                // Delay treatments initialization, otherwise selected treatments values are overwritten because other
                // AngularJS are triggering updates.
                $timeout(function(){
                    TreatmentsService.setTreatmentValues(localStorageValues.treatmentValues);
                    TreatmentsService.setTreatments(localStorageValues.treatmentsSelected);
                    TreatmentsService.loadingTreatmentsFromLocalStorage(false);
                    TreatmentsService.loadingTreatmentsValuesFromLocalStorage(false);
                    $rootScope.$broadcast('risksSelectedChanged');
                }, 1000);
            });
        } else {
            flash.error = 'Some error occured while trying to upload DSS session file';
        }
    };

    // Private function to read files as strings
    var readFile = function(file){
        var fileReader = new FileReader();
        var deferred = $q.defer();
        fileReader.readAsText(file);
        fileReader.onload = function(){
            deferred.resolve(fileReader.result);
        };
        return deferred.promise;
    };

    /**
     * Saves the user services selection on a file.
     * @param event
     */
    $scope.saveCloudSelection = function (event) {
        var element = angular.element(event.target);

        // Set export file name
        var fileName = ($scope.xmlTaAssetsFileName == '') ? 'DSS_CloudServicesSelection.xml' : 'export_' + $scope.xmlTaAssetsFileName;
        element.attr({
            download: fileName,
            href: 'data:application/xml;charset=utf-8,' + decodeURI(x2js.json2xml_str($scope.xmlAsJsonObject)),
            target: '_blank'
        });
        console.log(decodeURIComponent(x2js.json2xml_str($scope.xmlAsJsonObject)));

    };

}]);

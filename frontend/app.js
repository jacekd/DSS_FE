/* global angular */

// bootstrap definitions and UI interactions
$('#dssSlides').carousel('pause' ,{
    wrap: false,
    interval: false
}).on('slid.bs.carousel', function () {

    var topMenu = $('.topMenu');
    var slideClass = $(this).find('.active');
    var stickyBottom = $('.sticky-bottom');
    var cloudServicesButton = stickyBottom.find('.slide-services');
    topMenu.find('blockquote p').removeClass('active');

    if (slideClass.hasClass('bsoia-slide')) {
        topMenu.find('.bsoia-slide blockquote p').addClass('active');
        stickyBottom.find('.slide-prev').prop('disabled', true);
        stickyBottom.find('.slide-next').prop('disabled', false);
        stickyBottom.find('.slide-next').css('display', 'inline');
        cloudServicesButton.css('display', 'none');
    } else if (slideClass.hasClass('toia-slide')) {
        topMenu.find('.toia-slide blockquote p').addClass('active');
        stickyBottom.find('.slide-prev').prop('disabled', false);
        stickyBottom.find('.slide-next').prop('disabled', false);
        stickyBottom.find('.slide-next').css('display', 'inline');
        cloudServicesButton.css('display', 'none');
    } else if (slideClass.hasClass('ta-slide')) {
        topMenu.find('.ta-slide blockquote p').addClass('active');
        stickyBottom.find('.slide-prev').prop('disabled', false);
        stickyBottom.find('.slide-next').prop('disabled', false);
        stickyBottom.find('.slide-next').css('display', 'inline');
        cloudServicesButton.css('display', 'none');
    } else if (slideClass.hasClass('risks-slide')) {
        topMenu.find('.risks-slide blockquote p').addClass('active');
        stickyBottom.find('.slide-prev').prop('disabled', false);
        stickyBottom.find('.slide-next').prop('disabled', false);
        stickyBottom.find('.slide-next').css('display', 'inline');
        cloudServicesButton.css('display', 'none');
    } else if (slideClass.hasClass('treatments-slide')) {
        topMenu.find('.treatments-slide blockquote p').addClass('active');
        stickyBottom.find('.slide-prev').prop('disabled', false);
        stickyBottom.find('.slide-next').css('display', 'none');
        cloudServicesButton.css('display', 'inline');
    } else {
        topMenu.find('.services-slide blockquote p').addClass('active');
        stickyBottom.find('.slide-prev').prop('disabled', false);
        stickyBottom.find('.slide-next').css('display', 'none');
        cloudServicesButton.css('display', 'none');
    }

});

var dssApp = angular.module('dssApp', [
    'LocalStorageModule',
    'angular-flash.service',
    'angular-flash.flash-alert-directive',
    'ngDragDrop',
    'angular-loading-bar',
    'angularFileUpload',
    'frapontillo.bootstrap-switch',
    'nouislider'
]).config(['cfpLoadingBarProvider', 'localStorageServiceProvider', '$rootScopeProvider', function(cfpLoadingBarProvider, localStorageServiceProvider, $rootScopeProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    localStorageServiceProvider.setPrefix('DSS');
    //$rootScopeProvider.digestTtl(100);
}]);

// Initialize UI if local storage data is available
dssApp.run(['AssetsService', 'RisksService', 'TreatmentsService', 'localStorageService', function(AssetsService, RisksService, TreatmentsService, localStorageService){
    // Don't touch this, order matters!
    AssetsService.loadingLocalStorageData(true);
    RisksService.loadingLocalStorageData(true);
    TreatmentsService.loadingTreatmentsFromLocalStorage(true);
    TreatmentsService.loadingTreatmentsValuesFromLocalStorage(true);
    AssetsService.setBSOIA(localStorageService.get('bsoiaAssetsSelected') ? localStorageService.get('bsoiaAssetsSelected') : []);
    AssetsService.setTOIA(localStorageService.get('toiaAssetsSelected') ? localStorageService.get('toiaAssetsSelected') : []);
    RisksService.setRiskBoundModels(localStorageService.get('riskBoundModels') ? localStorageService.get('riskBoundModels') : {});
    RisksService.setSimpleRisksLikelihoodConsequence(localStorageService.get('simpleRisksLikelihoodConsequence') ? localStorageService.get('simpleRisksLikelihoodConsequence') : {});
    RisksService.setMultipleRisksLikelihoodConsequence(localStorageService.get('multipleRisksLikelihoodConsequence') ? localStorageService.get('multipleRisksLikelihoodConsequence') : {});
    RisksService.setRisks(localStorageService.get('risksSelected') ? localStorageService.get('risksSelected') : []);
    TreatmentsService.setTreatmentValues(localStorageService.get('treatmentValues') ? localStorageService.get('treatmentValues') : {});
    TreatmentsService.setTreatments(localStorageService.get('treatmentsSelected') ? localStorageService.get('treatmentsSelected') : []);
    AssetsService.setCriticityBoundModels(localStorageService.get('criticityBoundModels') ? localStorageService.get('criticityBoundModels') : {});
    AssetsService.setTA(localStorageService.get('taAssets') ? localStorageService.get('taAssets') : []);
}]);

/******************************************************
 ********************* BSOIA SLIDE ********************
 *****************************************************/

//Show/hide x (close button) when hovering selected assets
$('body').on('mouseover', '.list-group > .selected-asset', function(e){
    $(this).find('.remove-asset').show();
    $(this).find('.remove-bsoia-in-toia').show();
});

$('body').on('mouseout', '.list-group > .selected-asset', function(e){
    $(this).find('.remove-asset').hide();
    $(this).find('.remove-bsoia-in-toia').hide();
});

//Show/hide x (close button) when hovering selected risks
$('body').on('mouseover', '.list-group > .selected-risk', function(e){
    $(this).find('.remove-risk').show();
});

$('body').on('mouseout', '.list-group > .selected-risk', function(e){
    $(this).find('.remove-risk').hide();
});

//Show/hide x (close button) when hovering selected bsoia tags in drop zones
$('body').on('mouseover', '.list-group > .dropzone', function(e){
    $(this).find('.remove-bsoia-in-toia-asset').show();
});

$('body').on('mouseout', '.list-group > .dropzone', function(e){
    $(this).find('.remove-bsoia-in-toia-asset').hide();
});

// TEMP
$('body').on('mouseover', '.list-group > .dropzone-wrapper', function () {
    $(this).find('.remove-dragdrop').show();
});
$('body').on('mouseout', '.list-group > .dropzone-wrapper', function (e) {
    $(this).find('.remove-dragdrop').hide();
});



//Show/hide x (close button) when hovering selected treatments
$('body').on('mouseover', '.list-group > .selected-treatment', function(e){
    $(this).find('.remove-treatment').show();
});

$('body').on('mouseout', '.list-group > .selected-treatment', function(e){
    $(this).find('.remove-treatment').hide();
});

$('body').on('mouseover', '.remove-ta-treatment', function(e){
    $(this).find('.remove-dragdrop').show();
});

$('body').on('mouseout', '.remove-ta-treatment', function(e){
    $(this).find('.remove-dragdrop').hide();
});

//Select2
$(function(){
    $('select[label="assets"]').select2({
        placeholder: 'Select an asset'
    });

    $('select[label="risks"]').select2({
        placeholder: 'Select a risk'
    });

    // Don't know why, but with optgroups, angular generates an extra option with incorrect value "?"
    var selects = $('select[label="treatments"]');
    _.each(selects, function(select){
        // Remove first extra option value
        $(select).children().first().remove();
        // Prepend a valid option value with no content
        $(select).prepend('<option></option>');
        // Generate select2
        $(select).select2({
            placeholder: 'Select a treatment'
        });
    });
});


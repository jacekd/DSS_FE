dssApp.controller('assetsController', function($scope, orientdbFactory, $localStorage) {
   // extend base controller
    //$injector.invoke(baseController, this, {$scope: $scope});

    $scope.asset = "";
    $scope.assetsSelected = $localStorage.assetsSelected || [];
    $scope.description = "";
    $scope.updateDescription = function (assetSelected) {
        $scope.asset.description = assetSelected.description;
    };

    $scope.$watch("assetsSelected", function (value) {
        $localStorage.assetsSelected = value;
    });

    // fetch data
    orientdbFactory.getMatching('Assets', '', function (data) {
        $scope.assets = data;
    });
});
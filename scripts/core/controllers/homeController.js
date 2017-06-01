/**
 * Created by fallegro on 14/09/2016.
 */

angular.module('homeController', ['grocery'])

    .controller("HomeController", ["$scope", "GroceryService",'$localStorage', '$location',  function($scope, GroceryService, $localStorage,$location){
        $scope.homelinks = GroceryService.getHomeLinks();

        $scope.verifyAuth = function() {
            if(typeof $localStorage.token == 'undefined')
                $location.path('/login');
            if(typeof $localStorage.id_azienda == 'undefined' && $localStorage.id_profilo == 3)
                $location.path('/chooseCompany');
        };

        $scope.isAuth = function() {
            return typeof $localStorage.token == 'undefined';
        };

    }])
    .directive('tileCustom', function() {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                item: '=data'
            },
            templateUrl: 'views/templates/tile-custom.html',
            replace: true,
            transclude: true
        };
    })

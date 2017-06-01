/**
 * Created by fallegro on 30/09/2016.
 */

'use strict';

/* Controllers */

angular.module('angularRestfulAuth', [])
    .controller('authCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'authServ', function($rootScope, $scope, $location, $localStorage, authServ) {

        /*$scope.signin = function() {
            var formData = {
                email: $scope.email,
                password: $scope.password
            }

            authServ.signin(formData, function(res) {
                console.log(res);
                $localStorage.token = res.data.token;
                $location.path('/');
            }, function() {
                console.log("err");
                $rootScope.error = 'Failed to signin';
            })
        };*/

        $scope.signup = function() {
            var formData = {
                email: $scope.email,
                password: $scope.password
            }

            authServ.save(formData, function(res) {
                $localStorage.token = res.data.token;
                $location.path('/me');
            }, function() {
                $rootScope.error = 'Failed to signup';
            })
        };

        $scope.me = function() {
            authServ.me(function(res) {
                $scope.myDetails = res;
            }, function() {
                $rootScope.error = 'Failed to fetch details';
            })
        };

        $scope.logout = function() {
            authServ.logout(function() {
                $localStorage.token = '';
                $localStorage.id_profilo = '';
                $localStorage.id_azienda = '';
                $location.path('/login');
            }, function() {
                $rootScope.error = 'Failed to logout';
            });
        };
    }])

    .controller('MeCtrl', ['$rootScope', '$scope', '$location', 'authServ', function($rootScope, $scope, $location, authServ) {

        authServ.me(function(res) {
            $scope.myDetails = res;
        }, function() {
            $rootScope.error = 'Failed to fetch details';
        })
    }]);

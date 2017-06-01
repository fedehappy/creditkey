/**
 * Created by fallegro on 31/08/2016.
 */

angular
    .module('themesApp', ['theme', 'theme.demos', 'angularRestfulAuth', 'ngStorage'])

    .config(['$provide', '$routeProvider', '$httpProvider', function($provide, $routeProvider, $httpProvider) {
        $httpProvider.defaults.headers.common['Access-Control-Allow-Headers'] = '*';
        'use strict';
        $routeProvider
            .when("/", {
                templateUrl: "views/home.html"
            })
            .when("/anagraficaList", {
                templateUrl: "views/anagraficaList.html",
                controller: "HomeController"
            })
            .when("/aziende", {
                templateUrl: "views/aziende.html",
                controller: "AdminController"
            })
            .when("/viewList", {
                templateUrl: "views/documents.html",
                controller: "ListController"
            })
            .when("/addItem", {
                templateUrl: "views/inputItem.html",
                controller: "DocumentItemController"
            })
            .when("/addItem/edit/:id", {
                templateUrl: "views/inputItem.html",
                controller: "DocumentItemController"
            })
            .when('/:templateFile', {
                templateUrl: function(param) {
                    return 'views/' + param.templateFile + '.html';
                }
            })
            .when('#', {
                templateUrl: 'views/home.html',
                controller: "HomeController"
            })
            .otherwise({
                redirectTo: "/"
            });


        $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {
            return {
                'request': function (config) {
                    config.headers = config.headers || {};
                    if ($localStorage.token) {
                        config.headers.Authorization = 'Bearer ' + $localStorage.token;
                        return config;
                    }
                    else{
                        $location.path('/login');
                        return config;
                    }
                },
                'responseError': function(response) {
                    if(response.status === 401 || response.status === 403) {
                        $location.path('/login');
                    }
                    return $q.reject(response);
                }
            };
        }]);

    }]);


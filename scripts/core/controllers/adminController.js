/**
 * Created by fallegro on 13/09/2016.
 */

angular.module('adminController', ['ngFileUpload'])

/*************************** *****************************/
/*************************** *****************************/
/*********************** SERVICE *************************/
/*************************** *****************************/
/*************************** *****************************/
    .service('serviceAsync', function ($http, $q, AdminService, $localStorage) {
        return {
            saveItem: function(entry, path) {
                var data = {
                    path: path,
                    data: entry
                };
                // the $http API is based on the deferred/promise APIs exposed by the $q service
                // so it returns a promise for us by default
                return $http({
                    url: baseUrl + '/saveItems',
                    method: "POST",
                    data: data
                }).then(function(response) {
                    // aggiorno la tabella
                    if(entry.id == 0)
                        AdminService.pushNewId(path, entry);
                    return true;
                }, function(response) {
                    return $q.reject(response.status);
                });
            },
            fileUpload: function(file, uploadUrl, unique_name) {
                var fd = new FormData();
                fd.append('file', file);
                return $http({
                    url: uploadUrl,
                    method: "POST",
                    data: fd,
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                }).then(function(response) {
                    return true;
                }, function(response) {
                    return $q.reject(response.status);
                });
            },
            getItems: function(path) {
                var data = {
                    path: path,
                    id_azienda: $localStorage.id_azienda,
                    id_profilo: $localStorage.id_profilo
                };
                // the $http API is based on the deferred/promise APIs exposed by the $q service
                // so it returns a promise for us by default
                return $http.get(baseUrl + "/getItems", { params: data })
                    .then(function(response) {
                        AdminService.adminItems = response.data;
                        for(var item in AdminService.adminItems){
                            AdminService.adminItems[item].data_add = new Date(AdminService.adminItems[item].data_add);
                        }
                        return AdminService.adminItems;
                    }, function(response) {
                        return $q.reject(response.status);
                    });
            },
            getLastId: function(path) {
                var data = {
                    path: path
                };
                return $http.get(baseUrl + "/getLastId", { params: data })
                    .then(function(response) {
                        return response.data;
                    }, function(response) {
                        return $q.reject(response.status);
                    });
            },
            pushNewId: function (path, new_item) {
                var data = {
                    path: path
                };
                $http.get(baseUrl + "/getLastId", { params: data })
                    .success(function (data) {
                        new_item.id = data;
                        AdminService.adminItems.push(new_item);
                    })
                    .error(function (data, status) {
                        alert("error to get");
                    })
            }
        };
    })
    .service('fileUpload', ['$http', '$localStorage', function ($http, $localStorage) {
        this.uploadFileToUrl = function(file, uploadUrl){
            var fd = new FormData();
            fd.append('file', file);
            $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
                .success(function(){
                })
                .error(function(){
                });
        }
    }])

    .service("AdminService", function($http, $filter, $localStorage){
        var adminService = {};
        adminService.adminItems = [];
        adminService.itemsForSelect = [];
        adminService.UserCompanies = [];

        adminService.isLoading = function(isLoading){
            if(isLoading){
                $('body').append('<div class="panel-loading"><div class="panel-loader-dots"></div></div>');
            }
            else{
                $('body').find('.panel-loading').remove();
            }
        };
        adminService.getItems = function(path){
            var data = {
                path: path,
                id_azienda: $localStorage.id_azienda,
                id_profilo: $localStorage.id_profilo
            };
            $http.get(baseUrl + "/getItems", { params: data })
                .success(function (data) {
                    adminService.adminItems = data;
                    for(var item in adminService.adminItems){
                        adminService.adminItems[item].data_add = new Date(adminService.adminItems[item].data_add);
                    }
                })
                .error(function (data, status) {
                });
            return adminService.adminItems;
        };

        adminService.GetItemsForSelect = function(){
            var data = {
                path: 'utenti'
            };
            $http.get(baseUrl + "/getItems", { params: data })
                .success(function (data) {
                    adminService.itemsForSelect.utenti = data;

                    for(var item in adminService.itemsForSelect.utenti){
                        adminService.itemsForSelect.utenti[item].data_add = new Date(adminService.itemsForSelect.utenti[item].data_add);
                    }
                })
                .error(function (data, status) {
                });
            var data = {
                path: 'aziende'
            };
            $http.get(baseUrl + "/getItems", { params: data })
                .success(function (data) {
                    adminService.itemsForSelect.aziende = data;

                    for(var item in adminService.itemsForSelect.aziende){
                        adminService.itemsForSelect.aziende[item].date = new Date(adminService.itemsForSelect.aziende[item].date);
                    }
                })
                .error(function (data, status) {
                });

            return adminService.itemsForSelect;
        };
        adminService.GetUserCompanies = function(){
            var data = {
                path: 'userCompanies',
                id_utente: $localStorage.id_utente
            };
            $http.get(baseUrl + "/getItems", { params: data })
                .success(function (data) {
                    adminService.UserCompanies.aziende = data;

                    for(var item in adminService.UserCompanies.aziende){
                        adminService.UserCompanies.aziende[item].date = new Date(adminService.UserCompanies.aziende[item].date);
                    }
                })
                .error(function (data, status) {
                });

            return adminService.UserCompanies;
        };


        //findById
        adminService.findById = function(id){
            for(var item in adminService.adminItems){
                if(adminService.adminItems[item].id === id)
                    return adminService.adminItems[item];
            }
        };

        //getNewId
        adminService.pushNewId = function (path, new_item) {
            var data = {
                path: path
            };
            $http.get(baseUrl + "/getLastId", { params: data })
                .success(function (data) {
                    new_item.id = data;
                    adminService.adminItems.push(new_item);
                })
                .error(function (data, status) {
                })
        };

        //markCompleted
        adminService.markCompleted = function (entry) {
            entry.completed = !entry.completed;
        }

        //removeItem service
        adminService.removeItem = function(path, entry){
            $http.post(baseUrl + "/deleteItem", {path: path, id: entry.id})
                .success(function (data) {
                    var index = adminService.adminItems.indexOf(entry);
                    adminService.adminItems.splice(index, 1);
                })
                .error(function (data, status) {
                })
        }

        //save
        adminService.save = function (entry, path) {
            var data = {
                path: path,
                data: entry
            };
            var updatedItem = adminService.findById(entry.id);
            if(updatedItem){
                $http.post("data/updated:item.json", entry)
                    .success(function (data) {
                        if(data.status == 1){
                            updatedItem.id = entry.id;
                            alert(updatedItem.id);
                            updatedItem.nome = entry.name;
                            updatedItem.email = entry.email;
                            updatedItem.date = entry.date;
                        }
                    })
                    .error(function (data, status) {
                        alert("error to update");
                    })

            }
            else{
                $http({
                    url: baseUrl + '/saveItems',
                    method: "POST",
                    data: data
                }).then(function() {
                    // aggiorno la tabella
                    adminService.pushNewId(path, entry);
                }, function(response) {
                    alert('Request failed');
                    var status = response.status;
                });
            }
        };

        return adminService;
    })





/*************************** *****************************/
/*************************** *****************************/
/******************** CONTROLLER *************************/
/*************************** *****************************/
/*************************** *****************************/

    .controller("AdminController", ["$scope", "$location", '$localStorage', '$modal', '$bootbox', '$timeout', '$log', "AdminService", "serviceAsync", "$routeParams", function($scope, $location, $localStorage, $modal, $bootbox, $timeout, $log, AdminService, serviceAsync, $routeParams){
        var path = $location.path().replace('/', '');
        if($routeParams.filter){
            $scope.filter = $routeParams.filter;
        }
        $scope.id_profilo = $localStorage.id_profilo;
        //$scope.itemsForSelect = AdminService.ItemsForSelect;

        getItems(path);
        function getItems(path){
            $scope.adminItems = AdminService.getItems(path);
        }

        $scope.removeItem = function(row){
            AdminService.removeItem(path, row);
            $scope.adminItems = AdminService.adminItems;
        };

        $scope.deleteConfirm = function(row) {
            $bootbox.confirm('Sei sicuro di voler eliminare la riga selezionata?', function(result) {
                if(result){
                    $scope.removeItem(row);
                }
            });
        };

        $scope.markCompleted = function (entry) {
            //AdminService.markCompleted(entry);
        };

        $scope.$watch(
            function () {
                $scope.adminItems = AdminService.adminItems;
                return AdminService.adminItems;
            }, function (adminItems) {
                $scope.adminItems = adminItems;
            }
        );
        $scope.$watch('itemsForSelect', function() {
            $scope.itemsForSelect = AdminService.itemsForSelect;
            return AdminService.itemsForSelect;
        }, function (itemsForSelect) {
            $scope.itemsForSelect = itemsForSelect;
        });

        /***************edit note ************/
        $scope.modalNote = function (size, selectedItem) {
            console.log(selectedItem);
            var modalInstance = $modal.open({
                templateUrl: 'modalNote.html',
                controller: function ($scope, $modalInstance) {
                    $scope.selectedItem = selectedItem;
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                },
                size: size,
                resolve: {
                    selectedItem: function() {
                        $scope.selectedItem = selectedItem;
                        return $scope.selectedItem;
                    }
                }
            });
            modalInstance.result.then(function(selectedItem) {
                $scope.selectedItem = selectedItem;
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }
        /*************** ***********/

        /*************************upload second file in modal **************************************************/
        $scope.uploadAdminFile = function(size, selectedItem) {
            var modalInstance = $modal.open({
                templateUrl: 'uploadAdminFile.html',
                controller: function($scope, $modalInstance, selectedItem, serviceAsync, AdminService) {
                    $scope.selectedItem = selectedItem;
                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };
                    $scope.upload = function(){
                        updateAndUpload();
                        function updateAndUpload(){
                            var d = new Date();
                            var timestamp = d.getTime();
                            $scope.myFile.name = timestamp + '-' +  $scope.myFile.name;
                            $scope.selectedItem.documento_2 = $scope.myFile.name;
                            $scope.selectedItem.id_azienda = selectedItem.id_azienda;
                            AdminService.isLoading(true);
                            serviceAsync.saveItem($scope.selectedItem, 'documents') //update ogetto
                                .then(function (result) {
                                    var file = $scope.myFile;
                                    console.log('file is ' );
                                    console.dir(file);
                                    var uploadUrl = baseUrl + "/upload";
                                    serviceAsync.fileUpload(file, uploadUrl)
                                        .then(function (result) {
                                            $modalInstance.close($scope.selectedItem);
                                            AdminService.getItems(path);
                                            AdminService.isLoading(false);
                                            $scope.openAlert("Documento caricato con successo!");
                                        }, function (error) {
                                            AdminService.isLoading(false);
                                            $scope.openAlert("Errore nel caricamento del documento!");
                                        });
                                }, function (error) {
                                    AdminService.isLoading(false);
                                    alert("Ops.. Errore inatteso.");
                                    $modalInstance.close($scope.selectedItem);
                                });
                        };
                    };
                    $scope.openAlert = function (message) {
                        $bootbox.alert(message, function() {
                            $location.path("/");
                        });
                    };
                    $scope.clickOnUpload = function() {
                        $timeout(function() {
                         angular.element('#myselector').triggerHandler('click');
                         }, 0);
                    };

                },
                size: size,
                resolve: {
                    selectedItem: function() {
                        $scope.selectedItem = selectedItem;
                        return $scope.selectedItem;
                    }
                }
            });
            modalInstance.result.then(function(selectedItem) {
                $scope.selectedItem = selectedItem;
                getItems(path);
                console.log(selectedItem);
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });

        };
        /*********************************************************************/
    }])

// GroceryListItemController
    .controller("AdminItemController", ["$scope", "$routeParams", "$location", "$bootbox", "AdminService", "serviceAsync", function($scope, $routeParams, $location, $bootbox, AdminService, serviceAsync){
        $scope.itemsForSelect = AdminService.GetItemsForSelect();

        $scope.$watch('itemsForSelect', function() {
            $scope.itemsForSelect = AdminService.itemsForSelect;
            return AdminService.itemsForSelect;
        }, function (itemsForSelect) {
            $scope.itemsForSelect = itemsForSelect;
        });

        if(!$routeParams.id){
            $scope.selectedItem = {id:0, completed: false, itemName: '', date: new Date()};
        }
        else{
            $scope.selectedItem = _.clone(AdminService.findById(parseInt($routeParams.id)));
        }

        $scope.save = function(){
            //salva azienda
            serviceAsync.saveItem($scope.selectedItem, 'aziende')
                .then(function (result) {
                    // ricevi l'ultimo id
                    serviceAsync.getLastId('aziende')
                        .then(function (result) {
                            // salva associazione
                            console.log($scope.selectedItem);
                            $scope.selectedItem.id_azienda = result;
                            serviceAsync.saveItem($scope.selectedItem, 'associazioni')
                                .then(function (result) {
                                    $scope.openAlert("Azienda creata con successo!");
                                }, function (error) {
                                    $scope.openAlert("Non è stato possibile creare l'azienda!");
                                });
                        }, function (error) {
                            alert("Ops.. Errore inatteso.");
                        });
                }, function (error) {
                    $scope.openAlert("Non è stato possibile creare l'azienda!");
                });
        };

        $scope.openAlert = function (message) {
            $bootbox.alert(message, function() {
                $location.path("/");
            });
        };
    }])

    // GroceryListItemController
    .controller("DocumentItemController", ["$scope", '$modal', '$bootbox', '$log', '$window', '$timeout', "$routeParams", "$location", "GroceryService", "serviceAsync", 'AdminService', 'fileUpload', '$localStorage', function($scope, $modal, $bootbox, $log, $window, $timeout, $routeParams, $location, GroceryService, serviceAsync, AdminService, fileUpload, $localStorage){
        if($routeParams.filter){
            $scope.filter = $routeParams.filter;
        }

        $scope.selectedItem = {id:0, completed: false, id_azienda: $localStorage.id_azienda, tipo: $scope.filter, documento_1: '', note: '', data_add: new Date()};

        $scope.save = function(){
            AdminService.isLoading(true);
            var d = new Date();
            var timestamp = d.getTime();
            $scope.selectedItem.documento_1 = $scope.myFile.name;
            serviceAsync.saveItem($scope.selectedItem, 'documents')
                .then(function (result) {
                    var file = $scope.myFile;
                    console.log('file is ' );
                    console.dir(file);
                    var uploadUrl = baseUrl + "/upload";
                    serviceAsync.fileUpload(file, uploadUrl)
                        .then(function (result) {
                            AdminService.isLoading(false);
                            $scope.openAlert("Documento inviato con successo!");
                        }, function (error) {
                            AdminService.isLoading(false);
                            $scope.openAlert("Errore nell'invio del documento!");
                        });

                }, function (error) {
                    AdminService.isLoading(false);
                    alert("Ops.. Errore inatteso.");
                    $modalInstance.close($scope.selectedItem);
                });
        };

        $scope.uploadFile = function(){
            var file = $scope.myFile;
            var uploadUrl = baseUrl + "/upload";
            var r = serviceAsync.fileUpload(file, uploadUrl);
            console.log(r);
        };
        $scope.openAlert = function (message) {
            $bootbox.alert(message, function() {
                $location.path("/");
            });
        };
        $scope.clickOnUpload = function() {
            $timeout(function() {
                angular.element('#myselector').triggerHandler('click');
            }, 0);
        };

    }])

    .controller('ModalsNewUserController', ['$scope', '$modal', '$bootbox', '$log', '$window', "$routeParams", "$location", "AdminService", "serviceAsync", 'authServ', '$localStorage', function($scope, $modal, $bootbox, $log, $window, $routeParams, $location, AdminService, serviceAsync, authServ, $localStorage) {
        'use strict';
        var alert = $window.alert;
        $scope.selectedItem = {id:0, nome: '', email: '', date: new Date()};

        $scope.openNewUser = function(size, selectedItem) {
            var modalInstance = $modal.open({
                templateUrl: 'modalContent.html',
                controller: function($scope, $modalInstance, adminItems, itemsForSelect) {
                    $scope.adminItems = adminItems;
                    $scope.itemsForSelect = itemsForSelect;
                    if(selectedItem.id)
                        $scope.selectedItem = selectedItem;
                    else
                        $scope.selectedItem = {id:0, nome: '', email: '', data_add: new Date()};
                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };
                    $scope.signup = function() {
                        if($scope.selectedItem.id > 0){
                            serviceAsync.saveItem($scope.selectedItem, 'utenti')
                                .then(function (result) {
                                    $scope.adminItems = AdminService.adminItems;
                                    $modalInstance.close($scope.selectedItem);
                                }, function (error) {
                                    alert("Ops.. Errore inatteso.");
                                    $modalInstance.close($scope.selectedItem);
                                });
                            $scope.adminItems = AdminService.adminItems;
                            $modalInstance.close($scope.selectedItem);
                        }
                        else{
                            var formData = {
                                email: $scope.selectedItem.email,
                                nome: $scope.selectedItem.nome,
                                password: 'demo'
                            }

                            authServ.save(formData, function(res) {
                                serviceAsync.getItems('utenti')
                                    .then(function (result) {
                                        $scope.adminItems = AdminService.adminItems;
                                        $modalInstance.close($scope.selectedItem);
                                    }, function (error) {
                                        alert("Ops.. Errore inatteso.");
                                        $modalInstance.close($scope.selectedItem);
                                    });
                                $modalInstance.close($scope.selectedItem);
                            }, function() {
                                $rootScope.error = 'Failed to signup';
                            })
                        }
                    };

                },
                size: size,
                resolve: {
                    adminItems: function() {
                        return AdminService.adminItems;
                    },
                    itemsForSelect: function() {
                        return AdminService.itemsForSelect;
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                $scope.selected = selectedItem;
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.openNewAssociazione = function(size) {
            $scope.itemsForSelect = AdminService.GetItemsForSelect();
            var modalInstance = $modal.open({
                templateUrl: 'modalContent.html',
                controller: function($scope, $modalInstance, adminItems, itemsForSelect) {
                    $scope.adminItems = adminItems;
                    $scope.itemsForSelect = itemsForSelect;
                    $scope.selectedItem = {id:0, name: '', azienda:'', email: '', date: new Date()};
                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };
                    $scope.save = function(){
                        serviceAsync.saveItem($scope.selectedItem, 'associazioni')
                            .then(function (result) {
                                serviceAsync.getItems('associazioni')
                                    .then(function (result) {
                                        $scope.adminItems = AdminService.adminItems;
                                        $modalInstance.close($scope.selectedItem);
                                    }, function (error) {
                                        alert("Ops.. Errore inatteso.");
                                        $modalInstance.close($scope.selectedItem);
                                    });
                            }, function (error) {
                                alert("Ops.. Errore inatteso.");
                                $modalInstance.close($scope.selectedItem);
                            });
                    };

                },
                size: size,
                resolve: {
                    adminItems: function() {
                        return AdminService.adminItems;
                    },
                    itemsForSelect: function() {
                        return AdminService.itemsForSelect;
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                $scope.selected = selectedItem;
                $scope.adminItems = AdminService.GetItemsForSelect();
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.editItemAzienda = function(size, selectedItem) {
            var modalInstance = $modal.open({
                templateUrl: 'modalContent.html',
                controller: function($scope, $modalInstance, adminItems, itemsForSelect) {
                    $scope.adminItems = adminItems;
                    $scope.itemsForSelect = itemsForSelect;
                    $scope.selectedItem = selectedItem;
                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };
                    $scope.save = function(){
                        serviceAsync.saveItem($scope.selectedItem, 'aziende')
                            .then(function (result) {
                                serviceAsync.getItems('aziende')
                                    .then(function (result) {
                                        $scope.adminItems = AdminService.adminItems;
                                        $modalInstance.close($scope.selectedItem);
                                    }, function (error) {
                                        alert("Ops.. Errore inatteso.");
                                        $modalInstance.close($scope.selectedItem);
                                    });
                            }, function (error) {
                                alert("Ops.. Errore inatteso.");
                                $modalInstance.close($scope.selectedItem);
                            });
                    };

                },
                size: size,
                resolve: {
                    adminItems: function() {
                        return AdminService.adminItems;
                    },
                    itemsForSelect: function() {
                        return AdminService.itemsForSelect;
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                $scope.selected = selectedItem;
                $scope.adminItems = AdminService.GetItemsForSelect();
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.$watch(
            function () {
                $scope.adminItems = AdminService.adminItems;
                return AdminService.adminItems;
            }, function (adminItems) {
                $scope.adminItems = adminItems;
            }
        );
        $scope.$watch('itemsForSelect', function() {
            $scope.itemsForSelect = AdminService.itemsForSelect;
            return AdminService.itemsForSelect;
        }, function (itemsForSelect) {
            $scope.itemsForSelect = itemsForSelect;
        });
    }])




/*************************** *****************************/
/*************************** *****************************/
/********************* DIRECTIVE *************************/
/*************************** *****************************/
/*************************** *****************************/
    .directive("aggiungiUtenteForm", function(){
        return{
            restrict: "AEC",
            templateUrl: "views/addUtente.html"
        }
    })
    .directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function(){
                    scope.$apply(function(){
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }])
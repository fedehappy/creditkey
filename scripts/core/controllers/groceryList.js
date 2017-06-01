/**
 * Created by fallegro on 12/09/2016.
 */
angular.module('grocery', ['ngRoute'])

/*************************** *****************************/
/*************************** *****************************/
/*********************** SERVICE *************************/
/*************************** *****************************/
/*************************** *****************************/

.service("GroceryService", function($http){
    var groceryService = {};
    groceryService.groceryItems = [];


    //findById
    groceryService.findById = function(id){
        for(var item in groceryService.groceryItems){
            if(groceryService.groceryItems[item].id === id)
                return groceryService.groceryItems[item];
        }
    };

    //getNewId
    groceryService.getNewId = function () {
        if(groceryService.NewId){
            groceryService.newId++;
            return groceryService.newId;
        }
        else{
            var maxId = _.max(groceryService.groceryItems, function(entry){return entry.id;});
            groceryService.newId = maxId.id + 1;
            return groceryService.newId;
        }
    };

    //markCompleted
    groceryService.markCompleted = function (entry) {
        entry.completed = !entry.completed;
    }

    //removeItem service
    groceryService.removeItem = function(entry){
        $http.post("data/delete_item.json", {id: entry.id})
            .success(function (data) {
                if(data.status){
                    var index = groceryService.groceryItems.indexOf(entry);
                    groceryService.groceryItems.splice(index, 1);
                }
            })
            .error(function (data, status) {
                alert("error to delete");
            })
    }

    //save item
    groceryService.save = function (entry) {
        var updatedItem = groceryService.findById(entry.id);
        if(updatedItem){
            $http.post("data/updated:item.json", entry)
                .success(function (data) {
                    if(data.status == 1){
                        updatedItem.completed = entry.completed;
                        updatedItem.itemName = entry.itemName;
                        updatedItem.date = entry.date;
                    }
                })
                .error(function (data, status) {
                    alert("error to update");
                })

        }
        else{
            $http.post("data/added_item.json", entry)
                .success(function (data) {
                    entry.id = data.newId;
                })
                .error(function (data, status) {
                    alert("error to save");
                })

            groceryService.groceryItems.push(entry);
        }

    }

        //get links for home page
        groceryService.getHomeLinks = function () {
            var homelinks = [];
            homelinks.push({ text: 'Analisi Centrali Rischi', href: '#/documents?filter=Analisi Centrale Rischi', title:'Vai al servizio', titleBarInfo: '', color: 'danger', classes: 'glyphicon glyphicon-list-alt' });
            homelinks.push({ text: 'Analisi Di Bilancio', href: '#/documents?filter=Analisi Di Bilancio', title:'Vai al servizio', titleBarInfo: '', color: 'info', classes: 'glyphicon glyphicon-list-alt' });
            homelinks.push({ text: 'Analisi Condizioni Bancarie', href: '#/documents?filter=Analisi Condizioni Bancarie', title:'Vai al servizio', titleBarInfo: '', color: 'success', classes: 'glyphicon glyphicon-list-alt' });
            homelinks.push({ text: 'Servizio Cash Flow', href: '#/cashflow', title:'Scopri di più', titleBarInfo: '', color: 'warning', classes: 'fa fa-star' });

            return homelinks;
        };

    return groceryService;
})





/*************************** *****************************/
/*************************** *****************************/
/******************** CONTROLLER *************************/
/*************************** *****************************/
/*************************** *****************************/

.controller("ListController", ["$scope","$routeParams", "$location", "GroceryService",  function($scope,$routeParams,$location, GroceryService){
        $scope.filter = $routeParams.filter;
        $scope.groceryItems = GroceryService.groceryItems;

    $scope.removeItem = function(entry){
        GroceryService.removeItem(entry);
    };

    $scope.markCompleted = function (entry) {
        //GroceryService.markCompleted(entry);
    };

    $scope.$watch(
        function () {
            $scope.groceryItems = GroceryService.groceryItems;
            return GroceryService.groceryItems;
        }, function (groceryItems) {
            $scope.groceryItems = groceryItems;
        }
    );

        //filtro per la tabella
        /*if(!$routeParams.filter){
            $scope.groceryItems = GroceryService.groceryItems;
        }
        else{
            $scope.groceryItem = _.clone(GroceryService.findById(parseInt($routeParams.id)));
        }*/






    }])

// GroceryListItemController
.controller("GroceryListItemController", ["$scope", "$routeParams", "$location", "GroceryService", function($scope, $routeParams, $location, GroceryService){
    /*$scope.groceryItems = GroceryService.groceryItems;
     $scope.groceryItem = {id:8, completed: true, itemName: 'Cheese', date: '2016-10-12'};*/

    if(!$routeParams.id){
        $scope.groceryItem = {id:0, completed: false, tipo: '', documento_1: '', note: '', data_add: new Date()};
    }
    else{
        $scope.groceryItem = _.clone(GroceryService.findById(parseInt($routeParams.id)));
    }

    $scope.save = function(){
        GroceryService.save($scope.groceryItem);
        $location.path("/");
    }

    //alert($scope.groceryItems);
}])



/*************************** *****************************/
/*************************** *****************************/
/********************* DIRECTIVE *************************/
/*************************** *****************************/
/*************************** *****************************/

.directive("faGroceryItem", function(){
    return{
        restrict: "E",
        templateUrl: "views/groceryItem.html"
    }
})
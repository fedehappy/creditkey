angular
  .module('theme.demos.signup_page', [
    'theme.core.services', 'angularRestfulAuth'
  ])
  .controller('SignupPageController', ['$rootScope', '$scope', '$location', '$localStorage', '$theme', 'authServ', 'AdminService', '$timeout', function($rootScope, $scope, $location, $localStorage, $theme, authServ, AdminService, $timeout) {
    'use strict';
    $theme.set('fullscreen', true);

    $scope.$on('$destroy', function() {
      $theme.set('fullscreen', false);
    });

    var path = $location.path().replace('/', '');

    if($localStorage.passwd_cambiata == 1)
      $scope.primo_login = false;
    else
      $scope.primo_login = true;
    $scope.password_new = '';
    $scope.password_confirm = '';
    $scope.password_cambiata = false;
    $scope.password = '';
    $scope.email = '';
    $scope.signin = function() {
      var formData = {
        email: $scope.email,
        password: $scope.password
      };
      authServ.signin(formData, function(res) {
        if(res.type){
          console.log(res.data);
          $localStorage.id_profilo = res.data[0].id_profilo;
          $localStorage.id_utente = res.data[0].id_utente;
          $localStorage.passwd_cambiata = res.data[0].passwd_cambiata;
          $localStorage.token = res.data[0].token;
          if($localStorage.passwd_cambiata != 1 && $localStorage.id_profilo != 1){
            $location.path('/changepassword');
          }
          else if($localStorage.id_profilo == 3){
            $location.path('/chooseCompany');
          }
          else{
            $localStorage.id_azienda = -1;
            $location.path('/');
          }
        }
        else{
          alert("errore di login");
        }
      }, function() {
        $rootScope.error = 'Failed to signin';
      });

    };

    $scope.changePassword = function() {
      var formData = {
        id_utente: $localStorage.id_utente,
        password: $scope.password_new
      };
      authServ.changePassword(formData, function(res) {
        if(res.type){
          $scope.password_cambiata = true;
          $scope.password_new = '';
          $scope.password_confirm = '';
          $scope.alert = { type: 'success', msg: 'Password cambiata con successo!' };
          $localStorage.passwd_cambiata = 1;
          $timeout(function() {
            $location.path('/');
          }, 2000);
        }
        else{
          $scope.alert = { type: 'danger', msg: 'Errore inatteso!' };
        }
      }, function() {
        $scope.alert = { type: 'danger', msg: 'Errore inatteso!' };
      })
    };

    if(path == 'chooseCompany'){
      $scope.itemsForSelect = AdminService.GetUserCompanies();
    }

    $scope.selectAzienda = function (id_azienda) {
      $localStorage.id_azienda = id_azienda;
      $location.path('/');
    }


  }])
    .directive('equals', function() {
      return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function(scope, elem, attrs, ngModel) {
          if(!ngModel) return; // do nothing if no ng-model

          // watch own value and re-validate on change
          scope.$watch(attrs.ngModel, function() {
            validate();
          });

          // observe the other value and re-validate on change
          attrs.$observe('equals', function (val) {
            validate();
          });

          var validate = function() {
            // values
            var val1 = ngModel.$viewValue;
            var val2 = attrs.equals;

            // set validity
            ngModel.$setValidity('equals', ! val1 || ! val2 || val1 === val2);
          };
        }
      }
    });
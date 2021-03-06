'use strict';

/**
 * @ngdoc function
 * @name Hazri.controller:LoginCtrl
 * @description
 * # LoginCtrl
 */
angular.module('Hazri')
    .controller('LoginCtrl', function ($scope, $state, $ionicLoading, $ionicHistory, $q, FirebaseRef, $rootScope) {

        $scope.login = function (user) {

            if (window.cordova)
                cordova.plugins.Keyboard.close();

            if (user && user.email && user.password) {

                fblogin(user).then(function () {
                    $ionicLoading.hide();
                },
                    function (reason) {
                        $ionicLoading.hide();
                        console.log(reason);
                    });
            }
        };

        var fblogin = function (user) {

            if ($rootScope.isOnline) {
                $ionicLoading.show();
                var session;
                if (window.cordova)
                    session = 'default';
                else
                    session = 'sessionOnly';

                var deferred = $q.defer();
                FirebaseRef.authWithPassword({
                    'email': user.email,
                    'password': user.password
                }, function (error, authData) {
                    if (error) {
                        $rootScope.showAlert('Error', error);
                        deferred.reject();
                    } else {
                        //console.log('Authenticated successfully with payload:', authData);
                        $ionicHistory.nextViewOptions({
                            disableAnimate: true,
                            disableBack: true,
                            historyRoot: true
                        });
                        deferred.resolve();
                    }
                }, {
                        remember: session
                    });
                return deferred.promise;
            }
            else
                $rootScope.showAlert('No Internet');
        };

        $ionicHistory.nextViewOptions({
            disableBack: true
        });

    });

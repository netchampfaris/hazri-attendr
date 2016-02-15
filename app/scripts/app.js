'use strict';

/**
 * @ngdoc overview
 * @name Hazri
 * @description
 * # Initializes main application and routing
 *
 * Main module of the application.
 */


angular.module('Hazri', ['ionic', 'ngCordova', 'ngResource', 'firebase', 'ionic-datepicker', 'ngStorage'])

    .run(function ($ionicPlatform, $rootScope, $ionicPopup, $state, FirebaseAuth, FirebaseRef,
                   $ionicLoading, $cordovaNetwork, StudentInfo, $cordovaAppVersion, $localStorage) {

        $ionicPlatform.ready(function () {
            // save to use plugins here
            if (window.StatusBar) {
                if (ionic.Platform.isAndroid()) {
                    StatusBar.backgroundColorByHexString("#388E3C");
                } else {
                    StatusBar.styleLightContent();
                }
            }

            Firebase.INTERNAL.forceWebSockets();

            /*Get online information*/
            if(window.cordova) {
              $rootScope.isOnline = $cordovaNetwork.isOnline();
              $rootScope.$apply();
            }
            else {
              $rootScope.isOnline = true;
            }

            // listen for Online event
            $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
              $rootScope.isOnline = true;
              console.log('online');
              $rootScope.$apply();
            });

            // listen for Offline event
            $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
              $rootScope.isOnline = false;
              console.log('offline');
              $rootScope.$apply();
            });


            if (window.cordova)
                $cordovaAppVersion.getVersionNumber().then(function (version) {
                    $rootScope.appVersion = 'v' + version;
                });
            else
                $rootScope.appVersion = 'Web Version';


            FirebaseAuth.$onAuth(function (authData) {
                if (authData) {
                    $localStorage.authData = authData;
                    //$rootScope.authData = authData;
                    //console.log("Logged in as:", authData.uid);
                    FirebaseRef.child('teachers/'+authData.uid+'/name').once('value', function (data) {
                        $localStorage.userData = {
                          name: data.val()
                        };
                        /*$rootScope.authData.teachername = data.val();
                        $rootScope.$apply();*/
                    });
                    $state.go('main');
                } else {
                    //console.log("Logged out");
                    $state.go('login');
                }
            });

            $rootScope.logout = function () {
                $rootScope.confirmPopup('Logout', '', 'Logout', 'assertive').then(function (res) {
                    if (res) {
                        //console.log("Logging out from the app");
                      delete $localStorage.authData;
                      delete $localStorage.userData;
                      FirebaseAuth.$unauth();

                    } else {
                        //console.log("logout cancelled");
                    }
                });
            };

            $rootScope.goHome = function () {
                $state.go('main');
            }

            $rootScope.showAlert = function (title, message) {
                return $ionicPopup.alert({
                    title: title,
                    template: message,
                    okType: 'button-positive'
                });
            };

            $rootScope.confirmPopup = function (title, message, okText, okColor) {
                return $ionicPopup.confirm({
                    title: title,
                    template: message,
                    okType: 'button-' + okColor,
                    okText: okText
                });
            };

            $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
                // We can catch the error thrown when the $requireAuth promise is rejected
                // and redirect the user back to the home page
                if (error === "AUTH_REQUIRED") {
                    $state.go("login");
                }
            });

            $rootScope.$on('loading:show', function () {
                $ionicLoading.show();
            });
            $rootScope.$on('loading:hide', function () {
                $ionicLoading.hide();
            });
            $rootScope.$on('$stateChangeStart', function () {
                $rootScope.$broadcast('loading:show');
            });
            $rootScope.$on('$stateChangeSuccess', function () {
                $rootScope.$broadcast('loading:hide');
            });
        });

        $ionicPlatform.registerBackButtonAction(function (event) {
            if ($state.current.name == "main" || $state.current.name == "login") {
                $rootScope.confirmPopup('Exit Attendr', 'Are you sure you want to exit?', 'Exit', 'assertive')
                    .then(function (res) {
                        if (res) {
                            ionic.Platform.exitApp();
                        }
                    });
            }
            else if ($state.current.name == "select"){
              $state.go('main');
            }
            else if ($state.current.name == "attendance"){
              $state.go('select');
            }
            else
                $ionicHistory.goBack();
        }, 151);



    })

    .config(function ($ionicConfigProvider, $stateProvider, $urlRouterProvider) {

        // Application routing
        $stateProvider

            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl',
                resolve: {
                    "currentAuth": function (FirebaseAuth) {
                        return FirebaseAuth.$waitForAuth();
                    }
                }
            })

            .state('main', {
                url: '/main',
                cache: false,
                templateUrl: 'templates/main.html',
                controller: 'MainCtrl',
                resolve: {
                    "currentAuth": function (FirebaseAuth) {
                        return FirebaseAuth.$requireAuth();
                    }
                }
            })

            .state('viewAttendance', {
                url: '/viewattendance',
                cache: false,
                templateUrl: 'templates/view_attendance.html',
                controller: 'ViewAttendanceCtrl',
                params: {
                    info: null
                },
                resolve: {
                    "currentAuth": function (FirebaseAuth) {
                        return FirebaseAuth.$requireAuth();
                    },
                    "info": function ($stateParams, ViewCumuAtt) {
                        return ViewCumuAtt.get($stateParams.info);
                    }
                }
            })

            .state('select', {
                url: '/select',
                cache: false,
                templateUrl: 'templates/select.html',
                controller: 'SelectCtrl',
                resolve: {
                    "currentAuth": function (FirebaseAuth) {
                        return FirebaseAuth.$requireAuth();
                    }
                }
            })

            .state('attendance', {
                url: '/attendance',
                cache: false,
                templateUrl: 'templates/attendance.html',
                controller: 'AttendanceCtrl',
                params: {
                    selected: null
                },
                resolve: {
                    "currentAuth": function (FirebaseAuth) {
                        return FirebaseAuth.$requireAuth();
                    },
                    "info": function ($stateParams, StudentInfo) {
                        return StudentInfo.get($stateParams.selected);
                    }
                }
            });

        // redirects to default route for undefined routes
        $urlRouterProvider.otherwise('/login');

        $ionicConfigProvider.scrolling.jsScrolling(false);
        $ionicConfigProvider.navBar.alignTitle('left').positionPrimaryButtons('right');
    });



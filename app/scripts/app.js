'use strict';

/**
 * @ngdoc overview
 * @name Hazri
 * @description
 * # Initializes main application and routing
 *
 * Main module of the application.
 */


angular.module('Hazri', ['ionic', 'ngCordova', 'ngResource', 'firebase', 'ionic-datepicker'])

    .run(function ($ionicPlatform, $rootScope, $ionicPopup, $state, FirebaseAuth, FirebaseRef, $ionicLoading, _, StudentInfo, $cordovaAppVersion) {

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


            if (window.cordova)
                $cordovaAppVersion.getVersionNumber().then(function (version) {
                    $rootScope.appVersion = 'v' + version;
                });
            else
                $rootScope.appVersion = 'Web Version';


            FirebaseAuth.$onAuth(function (authData) {
                if (authData) {
                    $rootScope.authData = authData;
                    //console.log("Logged in as:", authData.uid);
                    FirebaseRef.child('teachers').once('value', function (data) {
                        $rootScope.authData.teachername = data.val()[$rootScope.authData.uid].name;
                        $rootScope.$apply();
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
                    },
                    "attendances": function (AttendanceService) {
                        return AttendanceService.getAttendances();
                    }
                }
            })

            .state('details', {
                url: '/main/details',
                templateUrl: 'templates/details.html',
                controller: 'DetailCtrl',
                params: {
                    key: null
                },
                resolve: {
                    "currentAuth": function (FirebaseAuth) {
                        return FirebaseAuth.$requireAuth();
                    },
                    "attInfo": function ($stateParams, AttInfo) {
                        return AttInfo.get($stateParams.key);
                    }
                }
            })

            .state('viewAttendance', {
                url: '/main/viewattendance',
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
            })


        ;


        // redirects to default route for undefined routes
        $urlRouterProvider.otherwise('/login');

        $ionicConfigProvider.scrolling.jsScrolling(false);
        $ionicConfigProvider.navBar.alignTitle('left').positionPrimaryButtons('right');
    });



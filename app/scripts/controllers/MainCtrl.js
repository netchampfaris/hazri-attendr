'use strict';

/**
 * @ngdoc function
 * @name Hazri.controller:MainCtrl
 * @description
 * # MainCtrl
 */
angular.module('Hazri')
    .controller('MainCtrl', function ($scope, FirebaseRef, DBService, $ionicLoading,
        $ionicModal, $timeout, $state, $rootScope, $q, $localStorage) {

        $scope.$storage = $localStorage;
        $scope.$storage.attendances = $localStorage.attendances;

        $scope.naturalsort = function (no) {
          return parseInt(no);
        };

        $scope.syncFb = function (att, key) {
          //console.log(att);

            var attFb = {
                absentno: att.absentno,
                presentno: att.presentno,
                date: att.date,
                dept: att.dept.id,
                semester: att.semester.id,
                subid: att.subid.id,
                topic: att.topic,
                type: att.type.id,
                noofhours: att.noofhours,
                batchno: (att.batchno) ? att.batchno : null,
                year: att.year.id,
                timestamp: Firebase.ServerValue.TIMESTAMP,
                teacher: $localStorage.authData.uid
            };

            var sync = function () {

                var defer = $q.defer();
                if ($rootScope.isOnline) {
                    //reject promise after 45 secs, for conditions when wifi is connected but internet is not working
                    $timeout(function () {
                        defer.reject();
                    }, 45000);

                    FirebaseRef.child('attendances/' + att.dept.id).push(attFb, function (error) {
                        if (error) {
                            console.log('firebase push error');
                            defer.reject();
                        }
                        else {
                            console.log('fb pushed');
                            $scope.$storage.attendances[key].uploaded = true;
                            console.log('updated attendance successfully');
                            defer.resolve();
                        }
                    });
                }
                else {
                    defer.reject();
                }
                return defer.promise;
            };

            $ionicLoading.show();
            sync().then(function () {
                $ionicLoading.hide();
                console.log('sucessfull');
            }, function (error) {
                console.log(error);
                $ionicLoading.hide();
                $rootScope.showAlert(
                    'No Internet',
                    'Cannot connect to internet. This attendance will not be synced to database. Make sure to sync when internet is available.'
                    );
            });

        };

        $scope.deleteAtt = function (key) {
            $rootScope.confirmPopup(
                'Delete Attendance',
                'Are you sure you want to delete this attendance data',
                'Delete',
                'assertive'
                ).then(function (res) {
                    if (res){
                      delete $localStorage.attendances[key];
                      console.log('deleted ' + key + ' attendance successfully');
                    }
                });
        };

        $scope.newAtt = function () {
          var data = $localStorage.hazridata;

          if (typeof data == 'undefined') {
            $rootScope.confirmPopup(
              'No data',
              'In order to take attendance you need to download the student data from server',
              'Download',
              'positive'
            ).then(function (res) {
              if (res) {
                if($rootScope.isOnline){
                  $ionicLoading.show();
                  DBService.fetchData().then(function () {
                    $ionicLoading.hide();
                    $state.go('select');
                  }, function () {
                    console.log('error downloading data');
                  });
                }
                else
                  $rootScope.showAlert(
                    'No Internet',''
                  );
              }
            });
          }
          else $state.go('select');
        };

        $ionicModal.fromTemplateUrl('templates/settings.html', function ($ionicModal) {
            $scope.modal = $ionicModal;
        },{
            scope: $scope,
            animation: 'slide-in-up'
        });

        $scope.clear = function () {
            $rootScope.confirmPopup(
                'Delete Attendance data from device?',
                'Note: Only synced attendances will be deleted.',
                'Delete',
                'assertive'
                ).then(function (res) {
                    if (res) {
                      for(var key in $localStorage.attendances){
                        var curr = $localStorage.attendances[key];
                        if(curr.uploaded == true){
                          delete $localStorage.attendances[key];
                        }
                      }
                      console.log('deleted successfully');
                    } else {
                        console.log('delete cancelled');
                    }
                });
        };

        $scope.download = function () {
          if($rootScope.isOnline){
            $ionicLoading.show();
            DBService.fetchData().then(function () {
              $ionicLoading.hide();
            });
          }
          else
            $rootScope.showAlert(
              'No Internet',''
            );
        };

        $scope.about = function () {
            var appVersion = $rootScope.appVersion;
            $rootScope.showAlert(
                'About',
                '<p class=\'center\'>Attendr ' + appVersion + '<br>codename: hazri<br> Copyright &copy 2016</p>'
                );
        };

        $ionicModal.fromTemplateUrl('templates/devinfo.html', function ($ionicModal) {
            $scope.devmodal = $ionicModal;
        },
        {
            scope: $scope,
            animation: 'slide-in-up'
        });

      $scope.goto = function (link) {
        var ref = cordova.InAppBrowser.open(link, '_system', 'location=yes');
      }

    });


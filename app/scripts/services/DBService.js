'use strict';

/**
 * @ngdoc service
 * @name Hazri.DBService
 * @description
 * # DBService
 *
 */
angular.module('Hazri')
  .factory('DBService', function ($q, FirebaseRef, $cordovaToast, $localStorage) {

    var fetchData = function () {
      var deferred = $q.defer();
      $localStorage.hazridata = $localStorage.hazridata || {};

      if(angular.equals($localStorage.hazridata, {})){
        FirebaseRef.once('value', function (snap) {
          $localStorage.hazridata.departments = snap.val().departments;
          $localStorage.hazridata.studentCount = snap.val().studentCount;
          $localStorage.hazridata.students = snap.val().students;
          $localStorage.hazridata.subjects = snap.val().subjects;
          $localStorage.hazridata.year = snap.val().year;

          console.log('firebase data retrieved successfully');
          if(window.cordova)
            $cordovaToast.showShortBottom('Database downloaded successfully');
          deferred.resolve();

        }, function (error) {
          console.log(error.code);
          if(window.cordova)
            $cordovaToast.showShortBottom('Database download error');
          deferred.resolve();
        })
      }
      else{
        console.log('Yes data');

        FirebaseRef.once('value', function (snapshot) {
          if(angular.equals($localStorage.hazridata.departments,snapshot.val().departments) &&
            angular.equals($localStorage.hazridata.studentCount, snapshot.val().studentCount) &&
            angular.equals($localStorage.hazridata.students, snapshot.val().students) &&
            angular.equals($localStorage.hazridata.subjects, snapshot.val().subjects) &&
            angular.equals($localStorage.hazridata.year, snapshot.val().year)
          ){
            if(window.cordova)
              $cordovaToast.showShortBottom('Database is up-to-date');
            console.log('db uptodate');
          }
          else{
            $localStorage.hazridata.departments = snapshot.val().departments;
            $localStorage.hazridata.studentCount = snapshot.val().studentCount;
            $localStorage.hazridata.students = snapshot.val().students;
            $localStorage.hazridata.subjects = snapshot.val().subjects;
            $localStorage.hazridata.year = snapshot.val().year;

            console.log('db updated successfully');
            if(window.cordova)
              $cordovaToast.showShortBottom('Database updated successfully');
          }
          deferred.resolve();
        });
      }
      return deferred.promise;
    };

    return {
      fetchData: fetchData
    };
  });

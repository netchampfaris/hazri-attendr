'use strict';

/**
 * @ngdoc service
 * @name Hazri.DBService
 * @description
 * # DBService
 *
 */
angular.module('Hazri')
  .factory('DBService', function ($q, FirebaseRef, $cordovaToast, $rootScope) {

    var fetchData = function () {
      var deferred = $q.defer();

      localforage.getItem('hazridata').then(function (data) {
        if (!data) {    //if no data then download it
          console.log('no data');
          var hazridata = {};
          //firebase fetch
          FirebaseRef.once("value",
            function (snapshot) {

              hazridata.departments = snapshot.val().departments;
              hazridata.studentCount = snapshot.val().studentCount;
              hazridata.students = snapshot.val().students;
              hazridata.subjects = snapshot.val().subjects;
              hazridata.teachers = snapshot.val().teachers;

              localforage.setItem('hazridata', hazridata).then(function () {
                console.log('firebase data retrieved successfully');
                if(window.cordova) $cordovaToast.showShortBottom('Database downloaded successfully');
                deferred.resolve();
              });
            }, function (error) {
              console.log(error.code);
              if(window.cordova) $cordovaToast.showShortBottom('Database download error');
              deferred.resolve();
            });
        }
        else {  //if data present, then check if up-to-date
          console.log('yes data');
          FirebaseRef.once("value",
            function (snapshot) {
              if(angular.equals(data.departments,snapshot.val().departments) &&
                angular.equals(data.studentCount, snapshot.val().studentCount) &&
                angular.equals(data.students, snapshot.val().students) &&
                angular.equals(data.subjects, snapshot.val().subjects) &&
                angular.equals(data.teachers, snapshot.val().teachers)
              ){
                if(window.cordova) $cordovaToast.showShortBottom('Database is up-to-date');
                console.log('db uptodate');
              }

              else{
                var hazridata = {};
                hazridata.departments = snapshot.val().departments;
                hazridata.studentCount = snapshot.val().studentCount;
                hazridata.students = snapshot.val().students;
                hazridata.subjects = snapshot.val().subjects;
                hazridata.teachers = snapshot.val().teachers;
                console.log(hazridata);
                localforage.setItem('hazridata', hazridata).then(function () {
                  if(window.cordova) $cordovaToast.showShortBottom('Database updated successfully');
                  console.log('db updated');
                });
              }
              deferred.resolve();
            }, function (error) {
              console.log(error.code);
              deferred.resolve();
            });
        }
      });
      return deferred.promise;
    };

    return {
      fetchData: fetchData
    };
  });

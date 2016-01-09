'use strict';

/**
 * @ngdoc function
 * @name Hazri.controller:AttendanceCtrl
 * @description
 * # AttendanceCtrl
 */
angular.module('Hazri')
  .controller("AttendanceCtrl", function ($scope, $rootScope, info, $q, $ionicLoading, $ionicPopup, $ionicPopover, $state, $timeout, $ionicHistory) {

    $scope.topic = {};
    $scope.topic.name = '';
    console.log(info);

    $scope.students = info.students;
    var batchStart = info.batchStart;
    var batchEnd = info.batchEnd;
    var selectedOptions = info.selected;
    var totalStudents = info.totalStudents;

    $scope.askTopic = function() {
      var myPopup = $ionicPopup.show({
        template: '<input type="text" ng-model="topic.name">',
        title: 'Would you like to enter the topic you just taught?',
        subTitle: 'Please use specific topic name',
        scope: $scope,
        buttons: [
          { text: 'No' },
          {
            text: '<b>Yes</b>',
            type: 'button-positive',
            onTap: function (e) {
              if(!$scope.topic.name){
                e.preventDefault();
              }
              else
                return $scope.topic.name;
            }
          }
        ]
      });
      myPopup.then(function(res) {
        if(res)
          console.log('topic added:'+$scope.topic.name);
        else
          console.log('no topic');
        showConfirm();
      });
    };

    var showConfirm = function () {
      console.log($scope.students);

      $rootScope.confirmPopup(
        'Confirm Submit',
        'Are you sure you want to submit?',
        'Yes',
        'positive'
      ).then(function (res) {
        if (res) {
          console.log('You are sure');
          $ionicLoading.show();
          $timeout(function () {
            updateAttendance();
          }, 500);
        } else {
          console.log('You are not sure');
        }
      });
    };

    var updateAttendance = function () {
      var absent = [];
      for (var i = 0 ; i < $scope.students.length ; i++)
        if ($scope.students[i].absent === true)
          absent.push($scope.students[i].uid);
      //Natural sort
      function compareNumbers(a, b) {
        return a - b;
      }
      absent.sort(compareNumbers);
      var uids = _.pluck($scope.students, 'uid');
      var present = _.difference(uids, absent);

      //attendance object to store in local
      var attLocal = {
        absentno: absent,
        presentno: present,
        date: selectedOptions.date,
        dept: selectedOptions.dept,
        semester: selectedOptions.semester,
        subid: selectedOptions.subject,
        topic: $scope.topic.name,
        type: selectedOptions.type,
        noofhours: selectedOptions.noofhours,
        totalStudents: totalStudents,
        batchno: selectedOptions.batchno,
        bStart: batchStart,
        bEnd: batchEnd,
        year: selectedOptions.year,
        uploaded: false
      };

      storeLocal(attLocal).then(function () {
        $state.go("main");
      });
      console.log("successfully took attendance");
    };

    var storeLocal = function (attInfo) {
      var defer = $q.defer();
      localforage.getItem('attendances').then(function (data) {
        if (data === null || data.length === 0) {
          var attendances = {};
          attendances['att0'] = attInfo;
          localforage.setItem('attendances', attendances).then(function () {
            localforage.getItem('attendances').then(function (data) {
              console.log("1st value pushed");
              console.log(data);
              defer.resolve();
            });
          });
        }
        else {
          localforage.getItem('attendances').then(function (data) {
            var newkey = 'att' + newIndex(data);
            data[newkey] = attInfo;
            localforage.setItem('attendances', data).then(function () {
              localforage.getItem('attendances').then(function (data) {
                console.log(newkey + " value pushed");
                console.log(data);
                defer.resolve();
              });
            });
          });
        }
      });
      return defer.promise;
    };

    var newIndex = function(object) {
      var max = 0;
      for(var key in object){
        if(object.hasOwnProperty(key)){
          var num = parseInt(key.slice(3));
          if(num > max) max = num;
        }
      }
      return max + 1;
    };

    $scope.showInfo = function ($event, student) {
      var template = '<ion-popover-view><ion-header style="text-align:center;color:white;"><strong>' + student.name + '</strong></ion-header></ion-popover-view>';
      $scope.popover = $ionicPopover.fromTemplate(template, {
        scope: $scope
      });
      $scope.popover.show($event);
    };

    $scope.toggle = function (student) {
      student.absent = !student.absent;
    };

    $ionicHistory.nextViewOptions({
      disableBack: true
    });

  });

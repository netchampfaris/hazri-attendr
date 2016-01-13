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
    //console.log(info);

    $scope.students = info.students;
    var batchStart = info.batchStart;
    var batchEnd = info.batchEnd;
    var selectedOptions = info.selected;
    var totalStudents = info.totalStudents;

    $scope.askTopic = function(students) {

      //console.log(students);

      var myPopup = $ionicPopup.show({
        template: '<textarea id="topic" rows="4" ng-model="topic.name" placeholder="Topic Name"></textarea>',
        title: 'Enter the topic you just taught',
        scope: $scope,
        buttons: [
          { text: 'Skip' },
          {
            text: '<b>Enter</b>',
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
        showConfirm(students);
      });
    };

    var showConfirm = function (students) {
      //console.log($scope.students);

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
            updateAttendance(students);
          }, 500);
        } else {
          console.log('You are not sure');
        }
      });
    };

    var updateAttendance = function (students) {


      var absent = _.filter(students,function(student){ return student.absent === true; });
      absent = _.pluck(absent, 'uid');

      var uids = _.pluck(students, 'uid');
      var present = _.difference(uids, absent);
      //console.log(absent);

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
              //console.log(data);
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
                //console.log(data);
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

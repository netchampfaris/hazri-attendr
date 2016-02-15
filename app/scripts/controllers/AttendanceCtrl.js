'use strict';

/**
 * @ngdoc function
 * @name Hazri.controller:AttendanceCtrl
 * @description
 * # AttendanceCtrl
 */
angular.module('Hazri')
  .controller("AttendanceCtrl", function ($scope, $rootScope, info, $q, $ionicLoading, $ionicPopup, $ionicPopover, $state, $timeout, $ionicHistory, $localStorage) {

    //console.log(info);

    $localStorage.attendances = $localStorage.attendances || {};

    var data = {
      batchEnd: info.batchEnd,
      batchStart: info.batchStart,
      batchno: info.batchno,
      selected: info.selected,
      students: info.students,
      totalStudents: info.totalStudents
    };

    //console.log(info);
    //console.log($localStorage.hazridata.students);
    $scope.students = data.students;
    var batchStart = data.batchStart;
    var batchEnd = data.batchEnd;
    var selectedOptions = data.selected;
    var totalStudents = data.totalStudents;
    $scope.att = selectedOptions;

    $scope.showConfirm = function (students) {

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

      var absentStudents = _.filter(students,function(student){ return student.absent === true; });
      var absent = _.pluck(absentStudents, 'uid');
      var absentrolls = _.pluck(absentStudents, 'rollno');

      var uids = _.pluck(students, 'uid');
      var present = _.difference(uids, absent);

      //attendance object to store in local
      var attLocal = {
        absentno: absent,
        absentroll:absentrolls,
        presentno: present,
        date: selectedOptions.date,
        dept: selectedOptions.dept,
        semester: selectedOptions.semester,
        subid: selectedOptions.subject,
        topic: selectedOptions.topic,
        type: selectedOptions.type,
        noofhours: selectedOptions.noofhours,
        totalStudents: totalStudents,
        batchno: selectedOptions.batch,
        bStart: batchStart,
        bEnd: batchEnd,
        year: selectedOptions.year,
        uploaded: false
      };
      var uid = generatePushID();
      $localStorage.attendances[uid] = attLocal;

      _.forEach(absent, function (uid) {
        $localStorage.hazridata.students[selectedOptions.dept.id][uid]['absent'] = false;
        //console.log($localStorage.hazridata.students[selectedOptions.dept.id][uid]);
      });

      $state.go("main");

      console.log("successfully took attendance");
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

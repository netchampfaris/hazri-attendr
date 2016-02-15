'use strict';

/**
 * @ngdoc function
 * @name Hazri.controller:SelectCtrl
 * @description
 * # SelectCtrl
 */
angular.module('Hazri')
  .controller('SelectCtrl', function ($scope, $ionicLoading, $q, $state, _, $localStorage, $ionicModal, $rootScope) {

    $scope.selected = {};
    $scope.depts    = [];
    $scope.years    = [];
    $scope.semArray = {};
    $scope.preset   = {
      save : false
    };

    $scope.$storage       = $localStorage;
    $localStorage.presets = $localStorage.presets || [];

    var hazridata = $localStorage.hazridata;
    var depts     = hazridata.departments;
    var years     = hazridata.year;
    var index;
    for (var key in depts) {
      if (depts.hasOwnProperty(key)) {
        var value = depts[key]['name'];
        $scope.depts.push({id : key, name : value});
      }
    }
    for (key in years) {
      if (years.hasOwnProperty(key)) {
        value                   = years[key]['name'];
        index = years[key].level;
        $scope.years[index - 1] = {id : key, name : value};
        $scope.semArray[key]    = years[key].sems;
      }
    }

    $scope.toggle = {
      dept    : false,
      year : false,
      sem  : false,
      type : false,
      batch : false,
      subject : false
    };

    $scope.$watch('selected', function () {
      $scope.toggle = {
        dept    : false,
        year : false,
        sem  : false,
        type : false,
        batch : false,
        subject : false
      };
    }, true);

    $scope.yearChanged = function () {
      $scope.selected.semester = null;
      $scope.selected.type     = null;
      $scope.selected.batch    = null;
      $scope.selected.subject  = null;
      $scope.subjects          = [];

      loadSems();
    };

    function loadSems() {
      if ($scope.selected.year) var key = $scope.selected.year.id;
      $scope.sems = $scope.semArray[key];
    }

    $scope.semChanged = function () {
      $scope.selected.type    = null;
      $scope.selected.batch = null;
      $scope.selected.subject = null;
      $scope.subjects         = [];
    };

    $scope.typeChanged = function () {
      $scope.selected.subject   = null;
      $scope.selected.batch   = null;
      $scope.selected.noofhours = 1;

      loadBatches();

      loadSubjects();

    };

    function loadBatches() {
      if ($scope.selected.type && $scope.selected.type.id == 'pr') {
        $scope.selected.noofhours = 2;

        var dept       = $scope.selected.dept.id;
        var year = $scope.selected.year.id;
        var batches = hazridata.studentCount[dept][dept + '-' + year]['batchno'];
        $scope.batches = _.chain(batches).filter(function (b) {
          return b != null;
        }).map(function (a, index) {
          return index + 1;
        }).value();
      }
    }

    function loadSubjects() {
      var subjects    = hazridata.subjects[$scope.selected.dept.id];
      subjects     = _.map(subjects, function (sub, key) {
        sub.id = key;
        return sub;
      });
      var type     = $scope.selected.type.value.toLowerCase();
      var filtered = _.filter(subjects, function (s) {
        return s.year == $scope.selected.year.id &&
          s.sem == $scope.selected.semester.id &&
          s[type]
      });
      $scope.subjects = _.map(filtered, function (sub) {
        return {
          id       : sub.id,
          fullname : sub.fullname,
          name     : sub.name
        }
      });
    }

    var formatDate = function (d) {
      var month = '' + (d.getMonth() + 1),
          day   = '' + d.getDate(),
          year  = d.getFullYear();

      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;

      return [year, month, day].join('-');
    };

    $scope.selected.date = formatDate(new Date());

    $scope.datepickerObject = {
      titleLabel       : 'Date',  //Optional
      closeLabel : 'Close',  //Optional
      setLabel   : 'Set',  //Optional
      inputDate  : new Date(),  //Optional
      mondayFirst : true,  //Optional
      templateType : 'modal', //Optional
      showTodayButton : 'true', //Optional
      modalHeaderColor : 'bar-positive', //Optional
      modalFooterColor : 'bar-stable', //Optional
      callback         : function (val) {  //Mandatory
        if (typeof (val) === 'undefined') {
          console.log('No date selected');
        } else {
          console.log('Selected date is : ', val);
          $scope.selected.date = formatDate(val);
        }
      },
      dateFormat       : 'dd-MM-yyyy', //Optional
      closeOnSelect    : true //Optional
    };

    $scope.gotoAtt = function (selected) {

      if ($scope.selected.dept && $scope.selected.year && $scope.selected.semester &&
        $scope.selected.type && $scope.selected.subject && $scope.selected.topic) {
        if ($scope.preset && $scope.preset.save) {
          var preset = {
            dept      : selected.dept,
            year : selected.year,
            semester : selected.semester,
            type     : selected.type,
            batch    : selected.batch,
            subject  : selected.subject,
            noofhours : selected.noofhours
          };
          if(checkPreset(preset)){
            $rootScope.showAlert('Alert', 'This preset already exists. It won\'t be saved.').then(function (res) {
              $state.go('attendance', {selected : selected});
              //console.log('test');
            });
          }
          else{
            $localStorage.presets.push(preset);
            $state.go('attendance', {selected : selected});
          }
        }
        else
          $state.go('attendance', {selected : selected});
      }
      else {
        $rootScope.showAlert('Uh uh', 'Please check for incomplete fields');
      }
    };

    $ionicModal.fromTemplateUrl('templates/presets.html', function ($ionicModal) {
      $scope.modal = $ionicModal;
    }, {
      scope     : $scope,
      animation : 'slide-in-up'
    });

    function checkPreset(preset) {
      var flag = false;
      _.forEach($localStorage.presets, function (savedPreset) {
        if(angular.equals(preset, savedPreset)){
          flag = true;
        }
      });
      return flag;
    }

    $scope.setOptions   = function (preset) {
      //$scope.selected       = preset;
      //console.log(preset)
      $scope.selected = {
        dept: preset.dept,
        year: preset.year,
        semester: preset.semester,
        type: preset.type,
        batch: preset.batch,
        subject: preset.subject,
        noofhours: parseInt(preset.noofhours)
      };
      $scope.selected.date = formatDate(new Date());
      $scope.selected.topic = null;
      loadSems();
      loadBatches();
      loadSubjects();
      $scope.modal.hide();
    };
    $scope.removePreset = function (index) {
      $scope.$storage.presets.splice(index, 1);
    }

  });

'use strict';

/**
 * @ngdoc function
 * @name Hazri.controller:SelectCtrl
 * @description
 * # SelectCtrl
 */
angular.module('Hazri')
    .controller('SelectCtrl', function ($scope, $ionicLoading, $q, $state, $ionicScrollDelegate, $timeout) {

        $scope.selected = {};
        var hazridata;

        $scope.$on('$ionicView.beforeEnter', function () {
            console.log('entered state select');
            //initialize values

            $scope.options = [
                {
                    id: 'dept',
                    name: 'Department',
                    values: []
                },

                {
                    id: 'year',
                    name: 'Year',
                    values: [
                        { id: 'fe', value: 'First Year' },
                        { id: 'se', value: 'Second Year' },
                        { id: 'te', value: 'Third Year' },
                        { id: 'be', value: 'Final Year' }
                    ]
                },

                {
                    id: 'semester',
                    name: 'Semester',
                    values: [{ id: 1, value: 'Semester 1' }, { id: 2, value: 'Semester 2' }]
                },

                {
                    id: 'type',
                    name: 'Type',
                    values: [
                        { id: 'th', value: 'Theory' },
                        { id: 'pr', value: 'Practical' }
                    ]
                },

                {
                    id: 'batchno',
                    name: 'Batch',
                    values: [],
                    show: false
                },

                {
                    id: 'subject',
                    name: 'Subject',
                    values: []
                }

            ];

            localforage.getItem('hazridata').then(function (data) {
                hazridata = data;
                var depts = hazridata.departments;
                for (var key in depts) {
                    if (depts.hasOwnProperty(key)) {
                        var value = depts[key]['name'];
                        $scope.options[0].values.push({ id: key, value: value });
                    }
                }
            });

            $scope.allSelected = false;
            if ($scope.selected.type) $scope.selected.type = undefined;
            if ($scope.selected.batchno) $scope.selected.batchno = undefined;
            if ($scope.selected.subject) $scope.selected.subject = undefined;

        });

        $scope.toggleOption = function (option) {
            if ($scope.isOptionShown(option)) {
                $scope.shownOption = null;
            } else {
                $scope.shownOption = option;
            }
        };

        $scope.isOptionShown = function (option) {
            return $scope.shownOption === option;
        };

        var formatDate = function (d) {
            var month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [year, month, day].join('-');
        };

        $scope.selected.date = formatDate(new Date());

        $scope.datepickerObject = {
            titleLabel: 'Date',  //Optional
            closeLabel: 'Close',  //Optional
            setLabel: 'Set',  //Optional
            inputDate: new Date(),  //Optional
            mondayFirst: true,  //Optional
            templateType: 'modal', //Optional
            showTodayButton: 'true', //Optional
            modalHeaderColor: 'bar-positive', //Optional
            modalFooterColor: 'bar-stable', //Optional
            callback: function (val) {  //Mandatory
                if (typeof (val) === 'undefined') {
                    console.log('No date selected');
                } else {
                    console.log('Selected date is : ', val);
                    $scope.selected.date = formatDate(val);
                }
            },
            dateFormat: 'dd-MM-yyyy', //Optional
            closeOnSelect: true //Optional
        };


        $scope.showBatchOptions = function () {

            var batchCount = 0;
            var studentCount;

            //$ionicLoading.show({ template: 'Getting Batch info...' });
            studentCount = hazridata.studentCount[$scope.selected.dept.id];

            for (var key in studentCount) {
                if (studentCount.hasOwnProperty(key)) {
                    var data = studentCount[key];
                    if ($scope.selected.year.id == data.year) {
                        batchCount = Object.keys(data.batchno).length;
                    }
                }
            }

            if (batchCount > 0) {
                for (var i = 1; i <= batchCount; i++) {
                    $scope.options[4].values.push({ id: i, value: 'Batch ' + i });
                }
            }
            //$ionicLoading.hide();

        };

        $scope.showSubOptions = function () {

            //proceed only if type field is selected and if type is practical then make sure that batch field is selected

            //$ionicLoading.show({ template: 'Getting subject list...' });

            var subjects = hazridata.subjects[$scope.selected.dept.id];

            for (var key in subjects) {
                if (subjects.hasOwnProperty(key)) {
                    var data = subjects[key];
                    if ($scope.selected.dept.id == data.dept_id && $scope.selected.year.id == data.year && $scope.selected.semester.id == data.sem) {
                        if ($scope.selected.type.id == 'th' && data.theory)
                            $scope.options[5].values.push({ id: key, value: data.fullname });
                        if ($scope.selected.type.id == 'pr' && data.practical)
                            $scope.options[5].values.push({ id: key, value: data.fullname });
                    }
                }
            }

            //$ionicLoading.hide();

        };

        $scope.showOptions = function (option) {
            if (option.id == 'dept') {
                $scope.toggleOption(option);
            }

            else if (option.id == 'year') {
                if ($scope.selected.dept) {
                    $scope.toggleOption(option);
                }
                else
                    $scope.showAlert('Uh uh..', 'Please select dept');
            }

            else if (option.id == 'semester') {
                if ($scope.selected.year) {
                    switch ($scope.selected.year.id) {
                        case 'fe': $scope.options[2].values = [{ id: 1, value: 'Semester 1' }, { id: 2, value: 'Semester 2' }]; break;
                        case 'se': $scope.options[2].values = [{ id: 3, value: 'Semester 3' }, { id: 4, value: 'Semester 4' }]; break;
                        case 'te': $scope.options[2].values = [{ id: 5, value: 'Semester 5' }, { id: 6, value: 'Semester 6' }]; break;
                        case 'be': $scope.options[2].values = [{ id: 7, value: 'Semester 7' }, { id: 8, value: 'Semester 8' }]; break;
                    }
                    $scope.toggleOption(option);
                }
                else
                    $scope.showAlert('Uh uh..', 'Please select year');
            }
            else if (option.id == 'type') {
                if ($scope.selected.semester) {
                    $scope.toggleOption(option);
                }
                else
                    $scope.showAlert('Uh uh..', 'Please select semester');
            }

            else if (option.id == 'batchno') {
                if ($scope.selected.type) {
                    if ($scope.selected.type.id == 'pr') {
                        $scope.options[4].values = [];
                        $scope.showBatchOptions();
                        $scope.toggleOption(option);
                    }
                }
                else
                    $scope.showAlert('Uh uh..', 'Please select type');
            }
            else if (option.id == 'subject') {
                if (($scope.selected.type && $scope.selected.type.id == 'th') || ($scope.selected.type && $scope.selected.type.id == 'pr' && $scope.selected.batchno)) {
                    $scope.options[5].values = [];
                    $scope.showSubOptions();
                    $scope.toggleOption(option);
                }
                else
                    $scope.showAlert('Uh uh..', 'Please select above fields');

            }

        };



        $scope.setSelected = function (item, option) {

            $scope.selected[option.id] = { id: item.id, value: item.value };

            $scope.toggleOption(option);

            if ($scope.selected.type && $scope.selected.type.id == 'pr') {
                $scope.options[4].show = true;
                $scope.selected.noofhours = 2;
            }
            if ($scope.selected.type && $scope.selected.type.id == 'th') {
                $scope.selected.noofhours = 1;
                $scope.options[4].show = false;
                $scope.selected.batchno = undefined;
            }
            if (option.id == 'year') {
                $scope.selected.semester = undefined;
            }
            if (option.id == 'semester') {
                $scope.options[5].values = [];
                $scope.selected.subject = undefined;
            }
            if (option.id == 'type') {
                $scope.options[5].values = [];
                $scope.selected.subject = undefined;
            }
            if ($scope.selected.dept && $scope.selected.year && $scope.selected.semester && $scope.selected.type && $scope.selected.subject)
                $scope.allSelected = true;

            console.log($scope.selected);
        };

        $scope.gotoAtt = function (selected) {
            if ($scope.selected.dept && $scope.selected.year && $scope.selected.semester && $scope.selected.type && $scope.selected.subject)
                $state.go('attendance', { selected: selected });
        };

    });

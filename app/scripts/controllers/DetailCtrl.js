'use strict';

/**
 * @ngdoc function
 * @name Hazri.controller:DetailCtrl
 * @description
 * # DetailCtrl
 */
angular.module('Hazri')
    .controller('DetailCtrl', function ($scope, attInfo, $state, isOnline, $rootScope) {

        $scope.att = attInfo.att;
        $scope.absentroll = attInfo.absentroll;

        $scope.showCumAtt = function (att) {

            var selectedOptions = {
                absentno: att.absentno,
                batch: att.batch,
                batchno: att.batchno || null,
                date: att.date,
                dept: att.dept,
                semester: att.semester,
                subject: att.subid,
                type: att.type,
                year: att.year
            };
            if (isOnline) {
                $state.go('viewAttendance',
                    {
                        info: {
                            selected: selectedOptions,
                            totalStudents: att.totalStudents,
                            bStart: att.bStart,
                            bEnd: att.bEnd
                        }
                    });
            }
            else
            {
                $rootScope.showAlert('No Internet', '');
            }
        };

    });

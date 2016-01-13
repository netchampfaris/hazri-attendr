'use strict';

/**
 * @ngdoc function
 * @name Hazri.controller:ViewAttendanceCtrl
 * @description
 * # ViewAttendanceCtrl
 */
angular.module('Hazri')
    .controller('ViewAttendanceCtrl', function ($scope, info, $ionicPlatform, $state) {

        $scope.items = info;

        $ionicPlatform.registerBackButtonAction(function (event) {
            $state.go('main');
        }, 100);

    });

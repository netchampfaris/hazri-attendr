'use strict';

/**
 * @ngdoc function
 * @name Hazri.service:AttendanceService
 * @description
 * # AttendanceService
 */
angular.module('Hazri')
// use factory for services
    .factory('AttendanceService', function ($q) {

        var getAttendances = function () {

            var deferred = $q.defer();

            localforage.getItem('attendances').then(function (data) {
                deferred.resolve(data);
            });

            return deferred.promise;
        };

        return {
            getAttendances: getAttendances
        };
    })

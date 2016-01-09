'use strict';

/**
 * @ngdoc service
 * @name Hazri.AttInfo
 * @description
 * # AttInfo
 *
 */
angular.module('Hazri')
  .factory("AttInfo", function ($q) {

    return {
      get: function (key) {
        var defer = $q.defer();

        localforage.getItem('attendances').then(function (attendances) {
          var att = attendances[key];
          defer.resolve(att);
        });
        return defer.promise;
      }
    }

  });


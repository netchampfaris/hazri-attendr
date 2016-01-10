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
          var dept = att.dept.id;
          var absentuids = att.absentno;


          localforage.getItem('hazridata').then(function (hazridata) {
            var students = hazridata.students[dept];
            var absentnos = [];
            for(var i=0; i<absentuids.length; i++)
              absentnos.push(students[absentuids[i]]['rollno']);
            defer.resolve({
              att: att,
              absentroll: absentnos
            });
          });
        });
        return defer.promise;
      }
    }

  });


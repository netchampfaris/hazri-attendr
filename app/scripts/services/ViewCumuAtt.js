'use strict';

/**
 * @ngdoc service
 * @name Hazri.ViewCumuAtt
 * @description
 * # ViewCumuAtt
 *
 */
angular.module('Hazri')
  .factory('ViewCumuAtt', function($q, $http) {

    return {
      get : function(info) {
        var defer = $q.defer();

        var selectedOptions = info.selected;
        var dept = selectedOptions.dept.id;
        var year = selectedOptions.year.id;
        var sem = selectedOptions.semester.id;
        var sub = selectedOptions.subject.id;
        var batchno = (selectedOptions.batchno) ? selectedOptions.batchno.id: null;
        var url = 'http://cors.io/?u=http://bvcoeportal.orgfree.com/api/subject_att_calc.php/' + dept + '/' + year + '/' + sem + '/' + sub;
        console.log(url);
        $http({
          method: 'GET',
          url: url
        }).then(function(response){
          if(selectedOptions.type.id == 'pr')
          {
            defer.resolve(response.data.attDataPr[sub][batchno-1]);
          }
          else
          {
            defer.resolve(response.data.attDataTh[sub]);
          }
        },function(error){
          console.log(error);
          defer.reject();
        });
        return defer.promise;
      }
    }

  });


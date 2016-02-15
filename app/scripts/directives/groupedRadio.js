'use strict';

/**
 * @ngdoc directive
 * @name groupedRadio
 * @description
 * # groupedRadio
 * horizontal radio button directive
 *
 */
angular.module('Hazri')
  .directive('groupedRadio', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        model: '=ngModel',
        value: '=groupedRadio'
      },
      link: function(scope, element, attrs, ngModelCtrl) {
        element.addClass('button button-small');
        element.on('click', function(e) {
          scope.$apply(function() {
            ngModelCtrl.$setViewValue(scope.value);
          });
        });

        scope.$watch('model', function(newVal) {
          element.removeClass('button-assertive');
          if (angular.equals(newVal, scope.value)) {
            element.addClass('button-assertive');
          }
        });
      }
    };
  });

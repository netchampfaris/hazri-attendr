'use strict';

/**
 * @ngdoc service
 * @name Hazri.FirebaseRef
 * @description
 * # FirebaseRef
 *
 */
angular.module('Hazri')
  .factory('FirebaseRef', function(FirebaseUrl) {

    var ref = new Firebase(FirebaseUrl.root);

    return ref;
  });


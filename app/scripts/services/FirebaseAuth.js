'use strict';

/**
 * @ngdoc service
 * @name Hazri.FirebaseAuth
 * @description
 * # FirebaseAuth
 *
 */
angular.module('Hazri')
  .factory("FirebaseAuth", function ($firebaseAuth, FirebaseUrl) {
      var ref = new Firebase(FirebaseUrl.root);
      return $firebaseAuth(ref);
  });


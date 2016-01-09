'use strict';

/**
 * @ngdoc function
 * @name Hazri.service:isOnline
 * @description
 * # isOnline
 */
angular.module('Hazri')
  // use factory for services
  .factory('isOnline', function($ionicPlatform) {

    var isOnline = function() {
      $ionicPlatform.ready(function () {
        if(window.cordova)
        {
          return $cordovaNetwork.isOnline();
        }
        else
          return true;
      });
    };

    return isOnline;

  });

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $ionicConfigProvider.views.maxCache(0);

  $stateProvider
  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })
  //actions
  
  .state('app.gettime', {
    url: "/gettime",
    controller: 'LocationCtrl'
  })
  
  //pages
  .state('app.home', {
    url: "/home",
    views: {
      'menuContent': {
        templateUrl: "templates/map.html",
        controller: 'MapCtrl'
      }
    }
  })

  .state('app.jobs', {
    url: "/jobs",
    views: {
      'menuContent': {
        templateUrl: "templates/jobs.html",
        controller: 'JobsCtrl'
      }
    }
  })

  .state('app.request', {
    url: "/request",
    views: {
      'menuContent': {
        templateUrl: "templates/request.html",
        controller: 'RequestCtrl'
      }
    }
  })

  .state('app.service', {
    url: "/service",
    views: {
      'menuContent': {
        templateUrl: "templates/service.html",
        controller: 'ServiceCtrl'
      }
    }
  })

  .state('app.driver', {
    url: "/driver",
    views: {
      'menuContent': {
        templateUrl: "templates/driver.html",
        controller: 'DriverCtrl'
      }
    }
  })

  .state('app.settings', {
    url: "/settings",
    views: {
      'menuContent': {
        templateUrl: "templates/settings.html",
        controller: 'SettingsCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ionic-toast', 'courseControllers', 'courseServices', 'ion-tree-list', 'ngCordova'])

.config(function($httpProvider){
    $httpProvider.defaults.timeout = 20000;
    $httpProvider.interceptors.push(function($rootScope){
        return {
            request:function(config) {
                        //config.timeout = 5000;
                        $rootScope.$broadcast('loading:show');
                        return config;
                    },
            response:function(config) {
                        $rootScope.$broadcast('loading:hide');
                        return config;
                    },
            requestError:function(config) {
                        $rootScope.$broadcast('loading:hide');
                        return config;
                    },
            responseError:function(config) {
                        $rootScope.$broadcast('loading:hide');
                        return config;
                    }
        };
    });
})

.run(function($ionicPlatform, $ionicHistory, $ionicPopup) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
  
    $ionicPlatform.registerBackButtonAction(function(e){
        var cname = $ionicHistory.currentStateName();
        if( cname == 'main.list' || cname == 'main.info' || cname == 'main.messages' || cname == 'main.config' || cname == 'login') {
            e.preventDefault();
            $ionicPopup.confirm({
                title:'提示',
                subTitle:'确定退出程序？',
                okText:'退 出',
                okType:'button-positive',
                cancelText:'取 消'
            }).then(function(res){
                if( res ) {
                    window.close();
                    ionic.Platform.exitApp();
                }
            });
        } else {
            $ionicHistory.goBack();
        }
    }, 101); 

})

.run(function($rootScope, $ionicLoading){
    $rootScope.$on('loading:show', function(){
        $ionicLoading.show({
            animation:'fade-in',
            templateUrl:"templates/loading.html"
        });
    });

    $rootScope.$on('loading:hide', function(){
        $ionicLoading.hide();
    });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    .state('login',{
        url:'/login',
        templateUrl:'templates/entry-login.html',
        controller:'loginController'
    })
    .state('main',{
        url:'/main',
        abstract:true,
        templateUrl:'templates/main-tabs.html'
    })
    .state('main.list',{
        url:'/clists',
        views:{
            'clistsView':{
                templateUrl:'templates/clists.html',
                controller:'clistsController'
            }
        }
    })
    .state('main.course',{
        url:'/courseSession',
        abstract:true,
        views:{
            'clistsView':{
                templateUrl:'templates/course.html',
                controller:'courseSessionMenuCtrl'
            }
        }
    })
    .state('main.course.content',{
        url:'/content/:sId',
        views:{
            'courseContentView':{
                templateUrl:'templates/course-content.html',
                controller:'courseSessionController'
            }
        }
    })
    .state('main.course.chat',{
        url:'/chat',
        views:{
            'courseContentView':{
                templateUrl:'templates/chat.html',
                controller:'chatController'
            }
        }
    })
    .state('main.info',{
        url:'/info',
        views:{
            'infoView':{
                templateUrl:'templates/info.html',
                controller:'infoController'
            }
        }   
    })
    .state('main.infocontent', {
        url:'/info/:iId',
        views:{
            'infoView':{
                templateUrl:'templates/info-content.html',
                controller:'infoController'
            }
        }
    })
    .state('main.messages',{
        url:'/messages',
        views:{
            'messageView':{
                templateUrl:'templates/messages.html',
                controller:'messagesController'
            }
        }
    })
    .state('main.readmsg',{
        url:'/messages/:mId',
        views: {
            'messageView':{
                templateUrl:'templates/msg-read.html',
                controller:'readMsgController'
            }
        }
    })
    .state('main.writemsg',{
        url:'/writemsg/:mId',
        views: {
            'messageView':{
                templateUrl:'templates/msg-write.html',
                controller:'writeMsgController'
            }
        }
    })
    .state('main.config',{
        url:'/config',
        views:{
            'configView':{
                templateUrl:'templates/config.html',
                controller:'configController'
            }
        }
    })

    ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

})
.directive('hideTabs', function($rootScope) {
    return {
        restrict: 'A',
        link: function($scope, $el) {
        $rootScope.hideTabs = 'tabs-item-hide';
        $scope.$on('$destroy', function() { $rootScope.hideTabs = ''; });
        }
    };
})
;

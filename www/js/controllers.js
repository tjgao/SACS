angular.module('courseControllers', ['courseServices'])

.controller('topController', function($scope, ionicToast, $ionicLoading, $localStorage, $rootScope){
    $rootScope.showToast = function(msg) {
        ionicToast.show(msg, 'middle', false, 2000);
    };

    $rootScope.server = $localStorage.get('server');
})

.controller('loginController', function($scope, $rootScope, $http, $location, $localStorage){
    if( !$rootScope.server ) {
        $http.get('https://raw.githubusercontent.com/tjgao/SpringBoard/master/server.json').then(function(resp){
            $rootScope.server = resp.data.server;
        }, function(err){
            $rootScope.showToast('无法获取服务器地址！');
        });
    }
    $scope.userinfo = {
        username:$localStorage.get('username',''),
        pwd:$localStorage.get('pwd','')
    };
    $scope.login = function() {
        if( !$rootScope.server ) {
            $rootScope.showToast('服务器地址未知，无法继续！');
            return;
        }
        if( !$scope.userinfo.username ) {
            $rootScope.showToast('用户名不能为空!');
            return;
        }
        $localStorage.set('remember',$scope.userinfo.remember);
        $http.get($rootScope.server + '/api/user/login/' + $scope.userinfo.username + '/' + $scope.userinfo.pwd).then(function(data){
            if( data.data.code == 0 ) {
                if( $scope.userinfo.remember) {
                    $localStorage.set('username',$scope.userinfo.username);
                    $localStorage.set('pwd',$scope.userinfo.pwd);
                }
                $rootScope.token = data.data.token;
                $rootScope.uid = data.data.uid;
                $location.path('/main/clists');
            } else {
                $rootScope.showToast('登录失败，请检查用户名和密码！');
            }
        }, function(err){
            $rootScope.showToast('无法登录，请确保网络连接正常！');
        });
    };
})

.controller('clistsController', function($scope, $http, $location){
})


.controller('infoController', function($scope, $http, $location){
})

.controller('messagesController', function($scope, $rootScope, $http, $location, $ionicPopover, messageResources){
    $scope.messages = {
        list:null,
        maxid:0,
        minid:0
    };
    messageResources.getMessages(0, 10, $rootScope.server, $rootScope.token).then(function(resp){
        if( resp.data.code == 0 ) {
            $scope.messages.list = resp.data.data;
            var sz = $scope.messages.list.length;
            if( sz > 0 ) {
                $scope.messages.maxid = $scope.messages.list[0].id;
                $scope.messages.minid = $scope.messages.list[sz-1].id;
            }
        }
    }, function(err){
        $rootScope.showToast('获取数据失败，请确保网络连接正常！');
    });

    $ionicPopover.fromTemplateUrl('templates/msg-popover.html', { scope: $scope, }).then(function(popover) { 
        $scope.popover = popover; 
    });

    $scope.loadNew = function() {
        console.log('loading new items...');
        if( !$rootScope.server || !$rootScope.token ) {
            $rootScope.showToast('程序状态错误，请重新登录！');
            return;
        }
        messageResources.loadNewMsg($scope.messages.maxid, $rootScope.server, $rootScope.token).then(function(resp){
            if( resp.data.code == 0 ) {
                var sz = resp.data.data.length;
                if( sz > 0 ) {
                    if( $scope.messages.list ) {
                        $scope.messages.list = resp.data.data.concat($scope.messages.list);
                    } else
                        $scope.messages.list = resp.data.data;
                    $scope.messages.maxid = $scope.messages.list[0].id;
                    $scope.messages.minid = $scope.messages.list[$scope.messages.list.length-1].id;
                }
            }
        }, function(err){
            $rootScope.showToast('获取数据失败，请确保网络连接正常！');
        });
    }

    $scope.loadOld = function() {
        console.log('loading old items...');
        
        if( !$rootScope.server || !$rootScope.token ) {
            $rootScope.showToast('程序状态错误，请重新登录！');
            return;
        }
        if( $scope.messages.minid <= 0 ) return;
        messageResources.loadOldMsg($scope.messages.minid, 10, $rootScope.server, $rootScope.token).then(function(resp){
            if( resp.data.code == 0 ) {
                var sz = resp.data.data.length;
                if( sz > 0 ) {
                    if( $scope.messages.list ) 
                        $scope.messages.list.concat(resp.data.data);
                    else
                        $scope.messages.list = resp.data.data;
                    $scope.messages.maxid = $scope.messages.list[0].id
                    $scope.messages.minid = $scope.messages.list[$scope.messages.list.length-1].id;
                }
            }
        }, function(err){
            $rootScope.showToast('获取数据失败，请确保网络连接正常！');
        });
    }

    $scope.writeMsg = function() {
        console.log('writeMsg called');
        $scope.popover.hide();
        $location.path('/main/writemsg/');
    }
})

.controller('readMsgController', function($scope, $http, $stateParams, $location){
    $scope.mId = $stateParams.mId;
    $scope.reply = function(mId) { 
        $location.path('/main/writemsg/' + mId)
    }
})

.controller('writeMsgController', function($scope, $rootScope, $http, $stateParams, $location, $ionicModal, $q, messageResources){
    $scope.openModal = function(){
        if( $scope.modal) {
            return $q.when();
        } else {
            return $ionicModal.fromTemplateUrl('templates/contacts.html',{
                scope:$scope,
                animation:'slide-in-up'
            }).then(function(modal){
                $scope.modal = modal;
            });
        }
    };

    $scope.mId = $stateParams.mId;
    $scope.compose = {};
    if( $scope.mId ) {
        messageResources.readMsg($scope.mId, $rootScope.server, $rootScope.token).then(function(resp){
            if( resp.data.code == 0 ) {
                $scope.compose.title = resp.data.title;
                var prefix = "Re: ";
                if( $scope.compose.title.slice(-prefix.length) != prefix )
                    $scope.compose.title = prefix + $scope.compose.title;
                if( resp.data.sender ) {
                    $scope.compose.receiver = [resp.data.sender];
                    $scope.compose.receiverName = [resp.data.senderName];
                    $scope.compose.receiverString = resp.data.senderName;
                    $scope.compose.content = '';
                }
            }
        }, function(err){
            $rootScope.showToast('获取数据失败，请确保网络连接正常！');
        }); 
    }

    $scope.send = function() {
        messageResources.sendMsg($scope.compose, $rootScope.server, $rootScope.token).then(function(resp){
            if( resp.data.code == 0 ) {
                $rootScope.showToast('发送成功!');
                $location.path('/main/messages');
            } else {
                $rootScope.showToast('未成功发送!');
            }
        }, function(err){
            $rootScope.showToast('获取数据失败，请确保网络连接正常！');
        });
    };

    $scope.contactList = [];

    $scope.contacts = function() {
        $scope.openModal().then(function() {
            $scope.modal.show();
            messageResources.contacts($rootScope.server, $rootScope.token).then(function(resp){
                if( resp.data.code == 0 ) {
                    $scope.contactList = resp.data.data;
                    //for( var i=0; i<$scope.contactList.length; i++) {
                    //    $scope.contactList[i].checked = false; 
                    //}
                } else {
                    $rootScope.showToast('收件人列表载入失败!');
                }
            }, function(err){
                $rootScope.showToast('获取数据失败，请确保网络连接正常！');
            });
        })
    };

    $scope.exitContacts = function() {
        $scope.modal.remove().then(function(){
            $scope.modal = null;
        });
    }

    $scope.ok = function() {
        $scope.modal.remove().then(function() {
            $scope.compose.receiver = [];
            $scope.compose.receiverName = [];
            for( var i=0; i<$scope.contactList.length; i++ ) {
                for( var j=0; j<$scope.contactList[i].tree.length; j++ ) {
                    if($scope.contactList[i].tree[j].checked ) {
                        console.log($scope.contactList[i].tree[j].realname + ' checked');
                        $scope.compose.receiver.push($scope.contactList[i].tree[j].id);
                        $scope.compose.receiverName.push($scope.contactList[i].tree[j].realname);
                    }
                }
            }
            $scope.compose.receiverString = $scope.compose.receiverName.join(', ');
            $scope.modal = null;
        });
    }

    $scope.contactChanged = function() {
        console.log('hahaha');
    }

})

.controller('configController', function($scope, $http){
})
;


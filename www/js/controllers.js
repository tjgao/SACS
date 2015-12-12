angular.module('courseControllers', ['courseServices'])

.controller('topController', function($scope, ionicToast, $ionicLoading, $localStorage, $rootScope, $cordovaFile, $ionicPlatform){
    console.log('topController called');
    $rootScope.showToast = function(msg) {
        ionicToast.show(msg, 'middle', false, 2000);
    };

    $rootScope.server = $localStorage.get('server');

    $rootScope.user = {};
    $ionicPlatform.ready().then(function(){
        //$cordovaFile.createDir(cordova.file.externalRootDirectory, 'CourseAgent', false);
    });
})

.controller('loginController', function($scope, $rootScope, $http, $location, $localStorage){
    console.log('loginController called');
    if( !$rootScope.server ) {
        $http.get('https://raw.githubusercontent.com/tjgao/SpringBoard/master/server.json').then(function(resp){
            $rootScope.server = resp.data.server;
            //$rootScope.server = 'http://localhost:8080/CourseAssist';
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
        $http.get($rootScope.server + '/api/user/login/' + $scope.userinfo.username + '/' + $scope.userinfo.pwd).then(function(data){
            try{
                if( data.data.code == 0 ) {
                    $localStorage.set('username',$scope.userinfo.username);
                    $localStorage.set('pwd',$scope.userinfo.pwd);
                    $rootScope.token = data.data.token;
                    $rootScope.user.uid = data.data.uid;
                    $rootScope.user.realname = data.data.realname;
                    $rootScope.user.nickname = data.data.nickname;
                    if( data.data.headimg ) {
                        $rootScope.user.headimg = $rootScope.server + '/' + $rootScope.user.headimg;
                    } else 
                        $rootScope.user.headimg = '';
                    $location.path('/main/clists');
                } else {
                    $rootScope.showToast('登录失败，请检查用户名和密码！');
                }
            } catch(err) {
                $rootScope.showToast('无法登录，请确保网络连接正常！');
            }
        }, function(err){
            $rootScope.showToast('无法登录，请确保网络连接正常！');
        });
    };
})

.controller('clistsController', function($scope, $http, $location, $rootScope, courseSessionResources){
    console.log('clistsController called');
    $scope.courseSessions = [];

    courseSessionResources.cslist($rootScope.server, $rootScope.token).then(function(resp){
        if( resp.data.code == 0 ) {
            $scope.courseSessions = resp.data.data; 
        } else {
            $rootScope.showToast('获取课程数据失败！');
        }
    }, function(err){
        $rootScope.showToast('无法登录，请确保网络连接正常！');
    });

})

.controller('courseSessionMenuCtrl', function($scope, $rootScope, $q, $ionicHistory, $ionicSideMenuDelegate, courseSessionResources, fileChooseService, $ionicModal, $location, pcResources, authResources ){

    $scope.courseSession = {};
    $scope.auth = {};
    $scope.identity = {};
    $scope.uploadFile = {};
    $scope.signature = {signed:false};
    $scope.chat = {};
    $scope.scanobj = {};

    $scope.courseInit= function() {
        $scope.courseSession = {};
        $scope.auth = {};
        $scope.identity = {};
        $scope.uploadFile = {};
        $scope.signature = {signed:false};
        $scope.chat = {};
        $scope.scanobj = {};
    }

    $scope.$on('ionicView.enter', function(){
        $scope.courseInit();
    });

    $scope.goback = function() {
        $ionicHistory.goBack();
    };

    $scope.toggleRight = function() {
        $ionicSideMenuDelegate.toggleRight();
    };

    $scope.chat = function() {
        $location.path('/main/courseSession/chat/' + $scope.courseSession.sid );
    }

    $scope.showbtn = function() {
        if($ionicHistory.currentStateName() == 'main.course.chat') return false;
        return true;
    }

    $scope.uploadToServer = function(where) {
        $scope.uploadFile.where = where;
        $scope.uploadFile.name = null;
        $scope.uploadFile.path = null;
        $scope.uploadFile.desc = null;
        $scope.domodal().then(function(){
            $scope.modal.show();
        });
    };


    $scope.domodal = function(){
        if( $scope.modal) {
            return $q.when();
        } else {
            return $ionicModal.fromTemplateUrl('templates/upload.html',{
                scope:$scope,
                animation:'slide-in-up'
            }).then(function(modal){
                $scope.modal = modal;
            });
        }
    };
    $scope.exitUpload = function() {
        $scope.modal.remove().then(function(){
            $scope.modal = null;
        });
    };


    $scope.fileChoose = function() {
        fileChooseService.chooseFile(['.ppt','pptx'], function(uri) {
            if( uri.length > 5 ) {
                if( uri.substring( uri.length - 5, uri.length ).toLowerCase() == '.pptx' ) {
                    $scope.uploadFile.ext = '.pptx';
                    $scope.uploadFile.path = uri;
                    return;
                }
                else if (uri.substring( uri.length - 4, uri.length ).toLowerCase() == '.ppt' ) {
                    $scope.uploadFile.ext = '.ppt';
                    $scope.uploadFile.path = uri;
                    return;
                }
            }
            $rootScope.showToast('请选择Powerpoint文件！');
        }, function(err){
            $rootScope.showToast('操作中发生异常！');
            $scope.uploadFile.path = null;
        })
    };

    $scope.doUpload = function() {
        if( $scope.uploadFile && $scope.uploadFile.path && $scope.uploadFile.name ) {
            courseSessionResources.uploadToServer($scope.courseSession.sid, 
                    $scope.uploadFile.name, $scope.uploadFile.ext, $scope.uploadFile.desc,
                    $scope.uploadFile.path, $rootScope.server, $rootScope.token).then(function(res){
                try{
                    var v = JSON.parse(res.response);
                    if( v.code == 0 ) {
                        $rootScope.showToast('文件成功上传！');
                        $scope.exitUpload();
                    }
                } catch(err) {
                    $rootScope.showToast('上传失败！');
                }
            },function(err){
                $rootScope.showToast('由于网络原因，无法操作！');
            });
        } else {
            $rootScope.showToast('请确保显示名和文件路径不为空！');
        }
    }

    $scope.toggleAttend = function() {
        authResources.getsignature($scope.courseSession.sid, $rootScope.server, $rootScope.token).then(function(r){
            if( r.data.code == 0 && $scope.auth.ip && $scope.auth.port && $scope.auth.token ) { 
                pcResources.toggleattend(r.data.data, $scope.courseSession.sid, $rootScope.user.uid, $scope.auth.ip, $scope.auth.port, $scope.auth.token).then(function(resp){
                    try{
                        if(resp.data.code == 0 ) {
                            $rootScope.showToast('操作成功！');
                        } else {
                            console.log('权限不足:' + resp.data.msg);
                        }
                    } catch(err) {
                        console.log(err);
                    }
                }, function(err){
                    console.log(err);
                });
            } else {
                $rootScope.showToast('未能成功获取签名！');
            }
        }, function(err){
            console.log(err);
        })
    }
})

.controller('courseSessionController', function($scope, $stateParams, $http, $location, $rootScope, courseSessionResources, $cordovaFileTransfer, $cordovaBarcodeScanner, $ionicPlatform, authResources, $cordovaFile, $interval, pcResources, $timeout, $ionicModal, $ionicScrollDelegate, $ionicSlideBoxDelegate){

    $scope.contentInit = function() {
        $scope.courseSession.sid = $stateParams.sId;
        $scope.getCourseInfo();
        $scope.coursePriv();
        $scope.signed();
    }

    $scope.$on('$ionicView.enter', function(scopes, states ){
        $scope.contentInit();
    });

    $scope.allImages = [ ];

    $scope.zoomMin = 1;
    $scope.watchTimer = null;

    $scope.watchslide = function(){
        if( !$scope.auth.ip ) {
            $rootScope.showToast('还未连接上教师机，无法操作！');
            return;
        }
        $scope.showModal('templates/blackboard.html');
    }

    $scope.startWatchTimer = function(time) {
        $scope.watchTimer = $timeout(function(){
            pcResources.watch($scope.auth.ip, $scope.auth.port).then(function(resp){
                if( resp.data.code == 0 ) {
                    var url = 'http://'+$scope.auth.ip+':'+$scope.auth.port+'/files/'+resp.data.data;
                    if( !($scope.allImages && $scope.allImages.length && $scope.allImages[0].src == url) ) 
                        $scope.allImages = [{src:'http://'+$scope.auth.ip+':'+$scope.auth.port+'/files/'+resp.data.data}];
                }    
                $scope.startWatchTimer(1500);
            }, function(err) {
                $scope.startWatchTimer(3000);
            });
        }, time);
    }

    $scope.showModal = function(templateUrl) {
        if( !$scope.identity || !$scope.identity.iamlecturer ) {
            $scope.startWatchTimer(0);
            $ionicModal.fromTemplateUrl(templateUrl, { scope:$scope })
            .then(function(modal){
                $scope.slideModal = modal;
                $scope.slideModal.show();
            });
            return;
        }
        pcResources.pptslides($scope.auth.ip, $scope.auth.port, $rootScope.user.uid, $scope.auth.token).then(function(resp) {
            if( resp.data.code == 0 ) {
                var slides = resp.data.data[0];
                var curslide = resp.data.data[1];
                if( slides == 0 || curslide == 0 ) {
                    $rootScope.showToast("没有打开的PPT！");
                    return;
                }
                $scope.activeSlide = curslide - 1;
                $scope.allImages = [];
                for( var i = 0; i<slides; i++ ) {
                    $scope.allImages.push({ src : 'http://' + $scope.auth.ip + ':' + $scope.auth.port + '/files/' + (i+1) + '.png'} );
                }
                $ionicModal.fromTemplateUrl(templateUrl, { scope:$scope })
                .then(function(modal){
                    $scope.slideModal = modal;
                    $scope.slideModal.show();
                });

            } else {
                $rootScope.showToast("没有打开的PPT！");
            }           
        }, function(err){
            $rootScope.showToast("网络错误，无法操作！");
        });
    }

    $scope.closeModal = function() {
        try{
            var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + $scope.activeSlide ).getScrollPosition().zoom;
            if( zoomFactor && zoomFactor > $scope.zoomMin ) return;
        } catch(e){}
        if($scope.watchTimer) {
            $timeout.cancel($scope.watchTimer);
            $scope.watchTimer = null;
        }
        $scope.slideModal.hide();
        $scope.slideModal.remove();
    }

    $scope.slideChanged = function(slide) {
        $scope.activeSlide = slide;
        pcResources.pptgoto( slide + 1, $scope.auth.ip, $scope.auth.port, $rootScope.user.uid, $scope.auth.token).then(function(resp){
            if( resp.data.code == 0 ) {}
        });
    }
    $scope.updateSlideStatus = function(slide) {
        if( !$scope.identity || !$scope.identity.iamlecturer ) {
            $ionicSlideBoxDelegate.enableSlide(true);
            return;
        }
        var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide ).getScrollPosition().zoom;
        if( zoomFactor == $scope.zoomMin ) $ionicSlideBoxDelegate.enableSlide(true);
        else $ionicSlideBoxDelegate.enableSlide(false);
    }

    $scope.toggleppt = function() {
        pcResources.toggleppt($scope.auth.ip, $scope.auth.port, $rootScope.user.uid, $scope.auth.token).then(function(resp){
            if( resp.data.code == 0 )
            console.log('toggle ppt');
        });
    }

    $scope.getCourseInfo = function() {
        courseSessionResources.courseSession($scope.courseSession.sid, $rootScope.server, $rootScope.token).then(function(resp){
            try{
                if( resp.data.code == 0 ) {
                    $scope.courseSession = resp.data.data;
                    courseSessionResources.cswarelist($scope.courseSession.sid, $rootScope.server, $rootScope.token).then(function(r){
                        if( r.data.code == 0 )
                        $scope.courseSession.swlist = r.data.data;
                    }, function(err){});
                } else {
                    $rootScope.showToast('获取课程数据失败！');
                }
            } catch(err) {
                $rootScope.showToast('无法登录，请确保网络连接正常！');
            }
        }, function(err){
            $rootScope.showToast('无法登录，请确保网络连接正常！');
        });
    };

    $scope.$on('$stateChangeStart', function(e, to, toParams, from, fromParams){
        if( to.name == 'main.list') {
            if( $scope.activeTimer )
                $timeout.cancel($scope.activeTimer);
            if( $scope.registerTimer )
                $timeout.cancel($scope.registerTimer);
            console.log('go back to upper level');
        }
        if( to.name == 'main.course.chat')
            console.log('goto chat now');
    });

    $scope.activated = function() {
        if( $scope.auth && $scope.auth.ip && $scope.auth.port ) {
            //$interval.cancel($scope.activeTimer);
            $scope.activeTimer = null;
            $scope.activeCounter = 1;
            return;
        }
        authResources.activated($scope.courseSession.sid, $rootScope.server, $rootScope.token).then(function(resp){
            try{
                if( resp.data.code == 0 ) {
                    if( resp.data.data != null ) {
                    $scope.auth.ip = resp.data.data.ip;
                    $scope.auth.port = resp.data.data.port;
                    $scope.auth.sid = resp.data.data.sid;
                    $scope.auth.token = resp.data.data.token;
                    return;
                    }
                } 
                $scope.resetActiveTimer();
            } catch(err) {
                $rootScope.showToast('无法登录，请确保网络连接正常！');
                $scope.resetActiveTimer();
            } 
        }, function(err){
            $rootScope.showToast('无法登录，请确保网络连接正常！');
            $scope.resetActiveTimer();
        });
        console.log('active timer is working');
    }

    $scope.resetActiveTimer = function() {
        if( $scope.activeCounter < 30) {
            $scope.activeCounter++;
        }
        //$interval.cancel($scope.activeTimer);
        $scope.activeTimer = $timeout($scope.activated, Math.floor(Math.random()*$scope.activeCounter + 1)*1000);
        console.log('active timer working ' + $scope.activeCounter);
    };

    $scope.activeTimer = $timeout($scope.activated, 500);
    $scope.activeCounter = 1;

    $scope.registerCounter = 1;
    $scope.resetRegTimer = function() {
        if( $scope.registerCounter < 30) {
            $scope.registerCounter++;
        }
        //$interval.cancel($scope.registerTimer);
        $scope.registerTimer = $timeout($scope.register, Math.floor(Math.random()*$scope.registerCounter+1)*1000);
        console.log('register timer working ' + $scope.registerCounter);
    };

    $scope.register = function() {
        pcResources.register($rootScope.user.realname, $rootScope.user.nickname, $rootScope.user.headimg, $scope.auth.ip, $scope.auth.port, $rootScope.user.uid, $scope.auth.token).then(function(resp){
            try{
                if( resp.data.code == 0 ) { 
                    $scope.auth.connected = true;
                    //$interval.cancel($scope.registerTimer);
                    $scope.registerCounter = 1;
                    $scope.registerTimer = null;
                    $rootScope.showToast('教师机连接成功！');
                    return;
                } 
                $scope.resetRegTimer();
            } catch(err) {
                $scope.resetRegTimer();
            }
        }, function(err){
            $rootScope.showToast('无法连接教师机，请检查网络设置！');
            $scope.resetRegTimer();
        });
    };


    $scope.$watch('auth', function() {
        if( !$scope.auth || !$scope.auth.ip ) return;
        console.log("try connecting to pc server: " + $scope.auth.ip);
        //$scope.registerTimer = $interval($scope.register, 500);
    });


    /*
    $scope.ontimeout = function() {
        if( $scope.auth.server ) { 
            pcResources.register($scope.auth.ip, $scope.auth.port, $scope.auth.token).then(function(resp){
                // it's alive, try connecting
                console.log('yes, got a respond');
                if( resp.data.code == 0 ) console.log('saying he is alive');
            }, function(err){
                // not alive, sleep for a few seconds
                $timeout($scope.ontimeout, 5000);
            });
        } else {
            //console.log('未能获得教师机的信息！');
            //$rootScope.showToast('未能获得教师机的信息！');
            $timeout($scope.ontimeout, 5000);
        }
    };
    */

//    $timeout($scope.ontimeout,5000); 
    $scope.coursePriv = function() {
        courseSessionResources.cspriv($scope.courseSession.sid, $rootScope.server, $rootScope.token).then(function(resp){
            try{
                if( resp.data.code == 0 ) {
                    $scope.identity.iamlecturer = resp.data.lecturer;
                } else {
                    $rootScope.showToast('获取数据失败！');
                }
            } catch(err) {
                $rootScope.showToast('无法登录，请确保网络连接正常！');
            }
        }
        , function(err){
            $rootScope.showToast('无法登录，请确保网络连接正常！');
        });
    };

    $scope.signed = function(){
        authResources.signed($scope.courseSession.sid, $rootScope.server, $rootScope.token).then(function(resp){
            try{
                if( resp.data.code == 0 ) {
                    if( resp.data.data == 'true') $scope.signature.signed = true;
                }
            } catch(err) {
                $rootScope.showToast('无法登录，请确保网络连接正常！');
            }
        }, function(err){
            $rootScope.showToast('无法登录，请确保网络连接正常！');
        });
    }


    $scope.download = function(url) {
        var filename = url.substring( url.lastIndexOf('/') + 1 );
        var target = cordova.file.externalRootDirectory + '/CourseAgent/' + filename; 
        var localUri = '';
        courseSessionResources.download(url, target, $rootScope.server).then(function(entry){
            $rootScope.showToast('文件成功下载！');
            localUri = entry.toURL();
            if( ionic.Platform.isIOS()) {
                cordova.InAppBrowser.open(localUri, '_blank');
            } else {
                courseSessionResources.openppt(localUri).then(function(){
                }, function(err){
                    $rootScope.showToast('无法打开文件！');
                });
            }
        }, function(err){
            $rootScope.showToast('无法下载此文件！');
        });
    }

    $scope.pcdownload = function(url) {
        console.log(url);
        if( $scope.auth.ip && $scope.auth.port && $scope.auth.token ) { 
        pcResources.pcdownload(url, $scope.auth.ip, $scope.auth.port, $rootScope.user.uid, $scope.auth.token).then(function(resp){
            try{
                if(resp.data.code == 0 )
                    $rootScope.showToast('操作成功!');
                else {
                    $rootScope.showToast('权限不足，无法操作！');
                }
            } catch(err) {
            }
        }, function(err){
        }); 
        } else {
            $rootScope.showToast('还未连接上教师机，无法操作！');
        }
    }

    $scope.scanobj.scan = function() {
        $scope.scanobj.result = {};
        $ionicPlatform.ready(function(){
            $cordovaBarcodeScanner
            .scan()
            .then(function(result){
                $scope.scanobj.result = {
                    text:result.text,
                    format:result.format,
                    cancelled:result.cancelled
                };
                $scope.scanobj.handle($scope.scanobj.result);
            }, function(err){
                $rootScope.showToast('获取扫描数据时发生错误！');
            });
        });
    };

    $scope.scanobj.handle = function(result) {
        var idx = result.text.indexOf(':');
        if( idx == -1 ) {
            console.log('UNRECOGNIZED!');
            return;
        }
        var head = result.text.substring( 0, idx ).trim();
        if( head == 'attend' ) {
            var body = result.text.substring( idx + 1 ).trim();
            var idx2 = body.indexOf(':');
            var _sid = body.substring( 0, idx2 ).trim();
            var code = body.substring( idx2 + 1 ).trim();
            if( _sid != $scope.courseSession.sid ) {
                $rootScope.showToast('课程ID不符，无法操作！');
                return;
            }
            authResources.attend( code, $scope.courseSession.sid, $rootScope.server, $rootScope.token).then(function(resp){
                if( resp.data.code == 0 ) {
                    $rootScope.showToast('签到成功！');
                    $scope.signed();
                    //TODO: 刷新
                } else {
                    $rootScope.showToast(resp.data.msg);
                }
            }, function(err){
                $rootScope.showToast('获取数据失败，请确保网络连接正常！');
            });
        } else if( head == 'activate' && $scope.identity.iamlecturer == 1) {
            var code = result.text.substring( idx + 1 ).trim();
            authResources.activate($scope.courseSession.sid, code, $rootScope.server, $rootScope.token).then(function(resp){
                if( resp.data.code == 0 ) {
                    console.log('received: ' + JSON.stringify(resp.data.data));
                    //need to update the token
                    $scope.activated2();
                } else {
                    $rootScope.showToast(resp.data.msg);
                }
            }, function(err){
                $rootScope.showToast('获取数据失败，请确保网络连接正常！');
            });
        }
    };

    $scope.activated2 = function() {
        authResources.activated($scope.courseSession.sid, $rootScope.server, $rootScope.token).then(function(resp){
            if(resp.data.code == 0 ) {
                $scope.auth.ip = resp.data.data.ip;
                $scope.auth.port = resp.data.data.port;
                $scope.auth.sid = resp.data.data.sid;
                $scope.auth.token = resp.data.data.token;
                $rootScope.showToast('已激活，并获得IP和端口信息！');
            }
        });
    };
})

.controller('chatController', function($scope, pcResources, $timeout, $rootScope){
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
                var sz = resp.data.size;
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
                var sz = resp.data.size;
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

.controller('readMsgController', function($scope, $rootScope, $http, messageResources, $stateParams, $location){
    $scope.mId = $stateParams.mId;
    if( $scope.mId ) {
        messageResources.readMsg( $scope.mId, $rootScope.server, $rootScope.token).then(function(resp){
            if( resp.data.code == 0 ) {
                $scope.message = resp.data.data;
            } else {
                $rootScope.showToast('读取消息失败！');
            }
        }, function(err){
            $rootScope.showToast('获取数据失败，请确保网络连接正常！');
        });
    }
    $scope.reply = function(mId) { 
        $location.path('/main/writemsg/' + mId)
    }
})

.controller('writeMsgController', function($scope, $rootScope, $http, $stateParams, $location, $ionicModal, $q, messageResources, $ionicHistory){
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
                $scope.compose.title = resp.data.data.title;
                var prefix = "Re: ";
                if( prefix != $scope.compose.title.substr(0,4) )
                    $scope.compose.title = prefix + $scope.compose.title;
                if( resp.data.data.sender ) {
                    $scope.compose.receiver = [resp.data.data.sender];
                    $scope.compose.receiverName = [resp.data.data.senderName];
                    $scope.compose.receiverString = resp.data.data.senderName;
                    $scope.compose.receiverIds = resp.data.data.sender;
                    $scope.compose.content = '';
                }
            } else {
                $rootScope.showToast('未能成功获取数据！');
            }
        }, function(err){
            $rootScope.showToast('获取数据失败，请确保网络连接正常！');
        }); 
    }

    $scope.send = function() {
        messageResources.sendMsg($scope.compose, $rootScope.server, $rootScope.token).then(function(resp){
            if( resp.data.code == 0 ) {
                $rootScope.showToast('发送成功!');
                $scope.compose = {};
                $ionicHistory.goBack();
                //$location.path('/main/messages');
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
            $scope.compose = {};
        });
    }

    $scope.ok = function() {
        $scope.modal.remove().then(function() {
            $scope.compose.receiver = [];
            $scope.compose.receiverName = [];
            for( var i=0; i<$scope.contactList.length; i++ ) {
                for( var j=0; j<$scope.contactList[i].tree.length; j++ ) {
                    if($scope.contactList[i].tree[j].checked ) {
                        $scope.compose.receiver.push($scope.contactList[i].tree[j].id);
                        $scope.compose.receiverName.push($scope.contactList[i].tree[j].realname);
                    }
                }
            }
            $scope.compose.receiverString = $scope.compose.receiverName.join(', ');
            $scope.compose.receiverIds = $scope.compose.receiver.join(',');
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


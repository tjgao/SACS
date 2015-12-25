angular.module('courseServices', [])
.factory('$localStorage', ['$window', function($window){
    return {
        set: function(key, val) { $window.localStorage[key] = val; },
        get: function(key, defaultVal) { return $window.localStorage[key] || defaultVal; },
        setObj: function(key, val) { $window.localStorage[key] = JSON.stringify(val); },
        getObj: function(key) { return JSON.parse($window.localStorage[key] || '{}'); },
        clear: function() { $window.localStorage.clear(); }
    };
}])

.factory('fileChooseService', function(){
    return {
        chooseFile: function(fileExt, then, errhandle) {
                        if( ionic.Platform.isIOS()) {
                            FilePicker.pickFile(then, errhandle);
                        } else {
                            //window.plugins.mfilechooser.open(fileExt, then, errhandle);
                            fileChooser.open(then, errhandle);
                        }
                    }
    };
})

.factory('authResources', function($http){
    return {
        activate: function(sId, code, server, token) {
                      return $http({
                          url: server + '/api/qr/scan/' + code + '/' + sId,
                          method:"POST",
                          headers: {
                            "Authorization":"Bearer " + token
                          }
                      });
                  },
        activated: function(sId, server, token) {
                       return $http({
                           url:server + '/api/qr/list/' + sId,
                           method:"GET",
                           headers: {
                            "Authorization":"Bearer " + token
                           }
                       });
                   },
        attend: function(sId, server, token ) {
                    return $http({
                        url: server + '/api/signature/signup/' + sId,
                        method:"POST",
                        headers: {
                            "Authorization":"Bearer " + token
                        }
                    });
                },
        signed: function(sId, server, token ) {
                    return $http({
                        url:server + '/api/signature/signed/' + sId,
                        method:"GET",
                        headers: {
                            "Authorization":"Bearer " + token
                        }
                    });
                },
        getsignature: function(sId, server, token) {
                          return $http({
                              url: server + '/api/signature/get/' + sId,
                              method:"GET",
                              headers: {
                                  "Authorization":"Bearer " + token
                              }
                          });
                      },
        /*
        createAttend: function(sId, server, token ) {
                          return $http({
                              url:server + '/api/signature/create/' + sId,
                              method:"POST",
                              headers: {
                                  "Authorization":"Bearer " + token
                              }
                          });
                      },
                      */
        attend: function(code, sId, server, token) {
                    return $http({
                        url: server + '/api/signature/signup/' + sId + '/' + code,
                        method:"POST",
                        headers: {
                            "Authorization":"Bearer " + token
                        }
                    });
                }
    };
})

.factory('pcResources', function($http, $cordovaFileTransfer){
    return {
        chat: function(msg, server, port, uid, token ) {
                    return $http({
                        url:'http://' + server + ':' + port + '/chat',
                        params:{"msg":msg},
                        headers: {
                            id:uid,
                            token:token
                        }
                    });
        },
        listen: function(cancel, server, port, uid, token) {
                    return $http({
                        url:'http://' + server + ':' + port + '/listen',
                        timeout: cancel,
                        headers: {
                            id: uid,
                            token: token
                        }
                    });
        },
        gameover: function(server, port, uid, token) {
                    return $http({
                        url:'http://'+server+':'+port+'/gameover',
                        headers:{
                            id: uid,
                            token: token
                        }
                    });
        },
        upload: function(name, ext, path, server, port, uid, token) {
                    var options = {
                        fileName:name + ext, 
                        httpMethod:"POST",
                        params:{"ext":ext, "name":name},
                        headers:{
                            id: uid,
                            token: token
                        }
                    };
                    return $cordovaFileTransfer.upload('http://' + server + ':' + port + '/upload', path, options);
        },
        fastwatch: function( server, port, uid, token ) {
                    return $http({
                        url: 'http://' + server + ':' + port + '/fastwatch',
                        method:'GET',
                        headers: {
                            id: uid,
                            token: token
                        }
                    });
        },
        watch: function( cancel, server, port, uid, token ) {
                    return $http({
                        url:'http://'+server+':'+port+'/watch',
                        timeout: cancel, 
                        method:'GET',
                        headers: {
                            id:uid,
                            token:token
                        }
                    });
        },
        pptslides: function( server, port, uid, token ) {
                        return $http({
                            url:'http://' + server + ':' + port + '/ppt_pages',
                            method:'GET',
                            headers: {
                                id: uid,
                                token: token
                            }
                        });
                },
        pptgoto: function(page, server, port, uid, token) {
                     return $http({
                         url:'http://' + server + ':' + port + '/ppt_goto',
                         method:'GET',
                         params:{
                             page: page
                         },
                         headers: {
                             id: uid,
                             token: token
                         }
                     });
                 },
        pptprev: function(server, port, uid, token) {
                     return $http({
                         url:'http://' + server + ':' + port + '/ppt_prev',
                         method:'GET',
                         headers: {
                             id: uid,
                             token: token
                         }
                     });
                 },
        pptnext: function(server, port, uid, token) {
                     return $http({
                         url:'http://' + server + ':' + port + '/ppt_next',
                         method:'GET',
                         headers: {
                             id: uid,
                             token: token
                         }
                     });
                 },
        togglepic: function(server, port, uid, token ) {
                       return $http({
                           url: 'http://' + server + ':' + port + '/togglepic',
                           method:'GET',
                           headers: {
                               id: uid,
                               token: token
                           }
                       });
                   }, 
        toggleppt: function(server, port, uid, token) {
                       return $http({
                           url:'http://' + server + ':' + port + '/toggleppt',
                           method: 'GET',
                           headers: {
                               id: uid,
                               token: token
                           }
                       });
                   },
        toggleattend: function(attstr, sid, uid, server, port, token) {
                        attstr = "attend:" + sid + ":" + attstr;
                        return $http({
                            url: 'http://' + server + ":" + port + '/toggleattend',
                            method:'POST',
                            params:{
                                attendstr:attstr
                            },
                            headers:{
                                id: uid,
                                token: token
                            } 
                        });
                    },
        register: function(qtype, uname, nickname, headimg, server, port, uid, token) {
                   var ulr = 'http://' + server + ':' + port;
                   return $http({
                       url: ulr + '/register',
                       method: 'GET',
                       params:{
                            qtype:qtype,
                            uname:uname,
                            nickname:nickname,
                            headimg:headimg
                       },
                       headers:{
                           id: uid,
                           token:token
                       }
                   });
               },
        unregister: function(server, port, uid, token) {
                    return $http({
                        url: 'http://' + server + ':' + port +'/unregister',
                        method:'GET',
                        headers:{
                            id: uid,
                            token: token
                        }
                    });
        },
        pcdownload: function(url, server, port, uid, token) {
                        var u = 'http://' + server + ':' + port + '/downloadppt';
                        return $http({
                            url: u,
                            params:{"url":url},
                            headers:{
                                id: uid,
                                token:token
                            }
                        });
                    }
    };
})

.factory('courseSessionResources', function($http, $cordovaFileTransfer, $cordovaFileOpener2){
    return {
        cslist: function(server, token) {
                    return $http({
                        url: server + '/api/courseSession/query',
                        method:"GET",
                        headers:{
                            "Authorization":"Bearer " + token 
                        }
                    });
                },
        courseSession: function(sId, server, token) {
                           return $http({
                               url:server + '/api/courseSession/' + sId,
                               method:'GET',
                               headers:{
                                   "Authorization":"Bearer " + token
                               }
                           });
                       },
        cspriv: function(sId, server, token) {
                    return $http({
                        url: server + '/api/courseSession/priv/' + sId,
                        method:"GET",
                        headers:{
                            "Authorization":"Bearer " + token
                        }
                    });
                },
        openppt: function(path) {
                    return $cordovaFileOpener2.open(path, 'application/vnd.ms-powerpoint'); 
                 },
        download: function(url, target, server) {
                      return $cordovaFileTransfer.download(server + '/' + url, target, true, {});
                  },
        uploadToServer: function(sId, name, ext, desc, path, server, token) {
                            var options = {
                                fileName:name + ext, 
                                httpMethod:"POST",
                                params:{"ext":ext, "name":name, "description":desc},
                                headers:{
                                    "Authorization":"Bearer " + token
                                }
                            };
                            return $cordovaFileTransfer.upload(server + '/api/sessionWare/upload/' + sId, path, options);
                        },
        cswarelist: function(sId, server, token) {
                        return $http({
                            url:server + '/api/sessionWare/query/' + sId,
                            method:"GET",
                            headers:{
                                "Authorization":"Bearer " + token
                            } 
                        });
                    },
        attendstat: function(sId, server, token) {
                        return $http({
                            url: server + '/api/signature/statistics/' + sId,
                            method:'GET',
                            headers:{
                                "Authorization":"Bearer " + token
                            }
                        });
                    }
    };
})

.factory('messageResources', function($http){
    return {
        contacts: function(server, token) {
                      return $http({
                          url: server + "/api/user/connected",
                          method:"GET",
                          headers:{
                              "Authorization":"Bearer " + token
                          }
                      });
                  },
        sendMsg:function(compose, server, token) {
                    return $http({
                        url:server + "/api/courseSession/messages/sendall",
                        method:"POST",
                        params:{
                            title:compose.title,
                            content:compose.content,
                            receiver:compose.receiverIds
                        },
                        headers:{
                            "Authorization":"Bearer " + token
                        }
                    });
                },
        readMsg:function(mId, server, token) {
                    return $http({
                        url:server + '/api/courseSession/messages/load/' + mId,
                        method:"GET",
                        headers:{
                            "Authorization":"Bearer " + token
                        }
                    });
                },
        getMessages:function(start, limit, server, token) {
               return $http({
                   url:server + '/api/courseSession/messages/receive/' + start + '/' + limit,
                   method:"GET",
                   headers:{
                       "Authorization":"Bearer " + token
                   }
               });
               },
        loadNewMsg:function(id, server, token) {
               return $http({
                   url:server + '/api/courseSession/messages/loadnew/' + id,
                   method:"GET",
                   headers:{
                       "Authorization":"Bearer " + token
                   }
               });
               },
        loadOldMsg:function(id, limit, server, token) {
               return $http.get({
                   url:server + '/api/courseSession/messages/loadold/' + id + '/' + limit,
                   method:"GET",
                   headers:{
                       "Authorization":"Bearer " + token
                   }
               });
               }
    };
})

;

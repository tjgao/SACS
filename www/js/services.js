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
                }
    };
})

.factory('pcResources', function($http){
    return {
        alive: function(server, port, token) {
                   var ulr = 'http://' + server + ':' + port;
                   return $http({
                       url: server + '/alive',
                       method: 'GET'
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
                                params:{"ext":ext,"name":name, "description":desc},
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

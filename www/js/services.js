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

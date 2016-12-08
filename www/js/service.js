angular.module('chatApp.services', [])

.factory("myFactory", function($q)  {
  var userDetails = {};
 // var deferred = $q.defer();

  function set(data) {
    userDetails = data; 
     console.log('entered set factory')
    console.log(userDetails);
  }

  function get() {
  // deferred.resolve(userDetails);
     return userDetails;
  //  return deferred.promise; 
  }

  return {
      set : set,
      get : get 
  }
})  

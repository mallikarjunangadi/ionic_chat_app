angular.module('chatApp.controller', [])

.controller('UserMessagesCtrl', ['$scope', '$rootScope', '$state',
 '$stateParams', 'myFactory', '$ionicActionSheet',
  '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$interval','$cordovaSQLite', '$rootScope', '$ionicHistory',
  function($scope, $rootScope, $state, $stateParams, myFactory,
    $ionicActionSheet, $ionicPopup, $ionicScrollDelegate, $timeout, $interval, $cordovaSQLite, $rootScope, $ionicHistory) {
      
     $scope.userDetails = {};  
     $scope.$on('$ionicView.beforeEnter', function(event, data) {
       console.log('entered before enter');
       $scope.userDetails = myFactory.get();
       console.log($scope.userDetails);

      $scope.toUser = {
      _id: $scope.userDetails.userId,
      pic: $scope.userDetails.avatar,
      username: $scope.userDetails.name
    }

    // this could be on $rootScope rather than in $stateParams
    $scope.user = {
      _id: 'mallikarjun123',
      pic: '/img/me.jpg',
      username: 'Mallikarjun'
    };

    $scope.input = {
      message: localStorage['userMessage-' + $scope.toUser._id] || ''
    };
      
    getMessages();  
    $scope.headerName = $scope.toUser.username;  
    });

    $scope.$on('$ionicView.enter', function() {
      console.log('UserMessages $ionicView.enter');

     /*   
      var query = "delete from UserMessages where id=7";
      $cordovaSQLite.execute($rootScope.db, query).then( function(res) {
        console.log('6 and 7 records deleted successfully');
      })
     */
     /*   
       var query = 'delete from UserMessages';
       $cordovaSQLite.execute($rootScope.db,query).then( function(res) {
        console.log('all records deleted');        
      })
     */ 
    
 //     getMessages();
      
      $timeout(function() {
        footerBar = document.body.querySelector('#userMessagesView .bar-footer');
        scroller = document.body.querySelector('#userMessagesView .scroll-content');
        txtInput = angular.element(footerBar.querySelector('textarea'));
      }, 0);

      messageCheckTimer = $interval(function() {
        // here you could check for new messages if your app doesn't use push notifications or user disabled them
      }, 20000);
    });

    $scope.$on('$ionicView.leave', function() {
      console.log('leaving UserMessages view, destroying interval');
      // Make sure that the interval is destroyed
      if (angular.isDefined(messageCheckTimer)) {
        $interval.cancel(messageCheckTimer);
        messageCheckTimer = undefined;
      }
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      if (!$scope.input.message || $scope.input.message === '') {
        localStorage.removeItem('userMessage-' + $scope.toUser._id);
      }
      $scope.messages = [];
      $scope.userDetails = {};
      $scope.headerName = "";
      console.log('cleared mesgs')
    });
     
    var messageCheckTimer;

    var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
    var footerBar; // gets set in $ionicView.enter
    var scroller;
    var txtInput; // ^^^    
 
     console.log('dummy......................................')   
    $scope.messages = [];

    function getMessages() {
      var query = "select * from UserMessages where userId = '"+$scope.toUser._id+"'"; //'sandeep123'"; 
      console.log('entered get messages...') 

     $cordovaSQLite.execute($rootScope.db, query).then( function(res) {
       console.log('responded rows :'+res.rows.length);
        for(var i = 0; i<res.rows.length ; i++) {
         $scope.messages[i] = {userId: res.rows.item(i).userId, name: res.rows.item(i).name, avatar: res.rows.item(i).avatar, messageText: res.rows.item(i).messageText, dateTimeMessage: res.rows.item(i).dateTimeMessage, messageType: res.rows.item(i).messageType};
      }   
    })    

        $timeout(function() {
          viewScroll.scrollBottom();
        }, 0);
      
    }

    $scope.$watch('input.message', function(newValue, oldValue) {
      console.log('input.message $watch, newValue ' + newValue);
      console.log('Old value:---------- '+oldValue);
      if (!newValue) newValue = '';
      localStorage['userMessage-' + $scope.toUser._id] = newValue;
    });

    $scope.sendMessage = function(sendMessageForm) {
      var message = {
        userId: $scope.toUser._id,
        messageText: $scope.input.message,
        dateTimeMessage: new Date(),
        name: $scope.toUser.username, 
        avatar: $scope.toUser.pic,
        messageType: 'sent'
      };

      // if you do a web service call this will be needed as well as before the viewScroll calls
      // you can't see the effect of this in the browser it needs to be used on a real device
      // for some reason the one time blur event is not firing in the browser but does on devices
      keepKeyboardOpen();
      
      //MockService.sendMessage(message).then(function(data) {
      $scope.input.message = '';
 
      $scope.hardcodeValues(message);
      $scope.messages.push(message);

      $timeout(function() {
        keepKeyboardOpen();
        viewScroll.scrollBottom(true);
      }, 0);

      $timeout(function() {
       var repliedMessage = {
         dateTimeMessage: new Date(),
         messageText: 'This text is hard coded and stored in database',
         messageType:'recieved',
         userId : $scope.toUser._id,
         name : $scope.toUser.username, 
         avatar : $scope.toUser.pic
        };
        
        console.log(message.messageType);
        $scope.hardcodeValues(repliedMessage);  //to save automatic hard coded reply messages

        $scope.messages.push(repliedMessage);
        keepKeyboardOpen();
        viewScroll.scrollBottom(true);
      }, 2000);
 
      //}); 
    }; 

    $scope.hardcodeValues = function(message) {
        var d= new Date();
        insertUserMessages(message.userId, message.name, message.avatar, message.messageText, d, message.messageType);
 /*       
         insertUserMessages('Akarsh123', 'Akarsh', '/img/paint.png', 'Good Morning bro, how r u?', d, 'recieved');
         insertUserMessages('darshan123', 'Darshan', '/img/happy.jpg', 'Good Morning, Mallikarjun', d, 'recieved');
         insertUserMessages('lingu123', 'Lingraj', '/img/tiger.jpg', 'Good Morning boss, whr r u?', d, 'recieved');
         insertUserMessages('akshay123', 'Akshay', '/img/plain.jpg', 'Hello bro, Good Morning', d, 'recieved');
         insertUserMessages('imAkarsh', 'Akarsh', '/img/photography1.jpg', 'Good Morning, Enjoy Coding', d, 'recieved');
 */
      }  

      function insertUserMessages(userId, name, avatar, messageText, dateTimeMessage, messageType) {
        var d = new Date();
        var query = "INSERT INTO UserMessages (userId, name, avatar, messageText, dateTimeMessage, messageType) VALUES (?,?,?,?,?,?)";
        $cordovaSQLite.execute($rootScope.db, query, [userId, name, avatar, messageText, dateTimeMessage, messageType]).then(function(res) {
            console.log("INSERT ID -> " + res.insertId);
            console.log("UserMessages records inserted successfully...");
        }, function (err) {
            console.error(err); 
        });
    }
    
    // this keeps the keyboard open on a device only after sending a message, it is non obtrusive
    function keepKeyboardOpen() {
      console.log('keepKeyboardOpen');
      txtInput.one('blur', function() {
        console.log('textarea blur, focus back on it');
        txtInput[0].focus();
      });
    }

    $scope.onMessageHold = function(e, itemIndex, message) {
      console.log('onMessageHold');
      console.log('message: ' + JSON.stringify(message, null, 2));
      $ionicActionSheet.show({
        buttons: [{
          text: 'Copy Text'
        }, {
          text: 'Delete Message'
        }],
        buttonClicked: function(index) {
          switch (index) {
            case 0: // Copy Text
              //cordova.plugins.clipboard.copy(message.text);

              break;
            case 1: // Delete
              // no server side secrets here :~)
              $scope.messages.splice(itemIndex, 1);
              $timeout(function() {
                viewScroll.resize();
              }, 0);

              break; 
          }
          
          return true;
        }  
      });
    };

    // this prob seems weird here but I have reasons for this in my app, secret!
    $scope.viewProfile = function(msg) {
      if (msg.userId === $scope.user._id) {
        // go to your profile
      } else {
        // go to other users profile
      }
    };
    
    // I emit this event from the monospaced.elastic directive, read line 480
    $scope.$on('taResize', function(e, ta) {
      console.log('taResize......'+ta+'...........');
      if (!ta) return;
      
      var taHeight = ta[0].offsetHeight;
      console.log('taHeight: ' + taHeight);
      
      if (!footerBar) return;
      
      var newFooterHeight = taHeight + 10;
      newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;
      
      footerBar.style.height = newFooterHeight + 'px';
      scroller.style.bottom = newFooterHeight + 'px'; 
    });
    
          
 // })    

 $scope.goBack = function() {
    $ionicHistory.goBack();
    console.log('entered back')
  }
}])   

//------------------ tabsCtrl Controller -------------------------------------------------

.controller('tabsCtrl', function($scope, $cordovaSQLite, $rootScope, $q, $state,  $http, myFactory) {
      $scope.userDetails = [];   // recent message user details
 /*     
      var jsonFile = '{ "channels": {'+
		'"channel 1": [{'+
		'	"name": "Mallikarjun",'+
		'	"avatar": "/img/me.jpg",'+
		'	"userId": "mallikarjun123"'+
		'}, {'+
		'	"name": "Sandeep",'+
		'	"avatar": "/img/paint.png",'+
		'	"userId": "sandeep123"'+
		'}, {'+
		'	"name": "Akarsh",'+
		'	"avatar": "/img/tiger.jpg",'+
		'	"userId": "akarsh123"'+
		'}],'+
		'"channel 2": [{'+
		'	"name": "Sindhu",'+
		'	"avatar": "/img/happy.jpg",'+
		'	"userId": "sindhu123"'+
		'}, {'+
		'	"name": "Sheetal",'+
		'	"avatar": "/img/tiger.jpg",'+
		'	"userId": "sheetal123"'+
		'}, {'+
		'	"name": "Akarsh",'+
		'	"avatar": "/img/ronaldo.jpg",'+
		'	"userId": "akarsh123"'+
		'}]}}'
 */     
       
    $http.get("js/data/channels.json").then(function (response) {
      console.log('Hai entered http');
      $scope.jsonData = response.data;  
   });  
       
 //      $scope.jsonData = JSON.parse(jsonFile);
       console.log($scope.jsonData);

      $scope.loadChannelUsers = function(key, value) {
      	var obj = {[key]:value}
        myFactory.set(obj);
        $scope.channelUsers = value;
        $state.go('channelMembers'); 
      }

      $scope.loadRecentChatMessages = function() { 
        console.log('entered loadRecentChatMessages');
        var query = "select distinct userId, name, avatar from UserMessages where messageText is not null"

        $cordovaSQLite.execute($rootScope.db, query).then( function(res) { 
          for(var i=0; i<res.rows.length; i++) {         
            $scope.userDetails[i] = {userId: res.rows.item(i).userId,  name: res.rows.item(i).name, avatar: res.rows.item(i).avatar };
          }
        }).then( function() { 
        // to select last message and date
                
          var len = $scope.userDetails.length;
          for(var i=0; i<len; i++) {
            var query = "select messageText, dateTimeMessage from UserMessages where userId='"+$scope.userDetails[i].userId+"'";

            (function(i) {
              $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
               if(res.rows.length==0) {
                $scope.userDetails[i].messageText = "";
                $scope.userDetails[i].dateTimeMessage = "";
             } else {
                $scope.userDetails[i].messageText = res.rows.item(res.rows.length-1).messageText;
                $scope.userDetails[i].dateTimeMessage = res.rows.item(res.rows.length-1).dateTimeMessage;
             } 
            })
           })(i); 
          }     
        })     
     }
 
 //set on-click recent message user object to myFactory
    $scope.setUserDetails = function(obj) {
      console.log('entered setUserDetails');
      console.log(obj);
      myFactory.set(obj);
      $state.go('UserMessages');     
    }
})

//-------------------------- channelMembersCtrl -----------------------------------

.controller('channelMembersCtrl', function($scope, myFactory, $state, $ionicHistory, $rootScope){
  $scope.$on('$ionicView.beforeEnter', function(event, data) {
    var channelUsers = myFactory.get();
    $scope.channelUsers = channelUsers;
    for(key in channelUsers) {$scope.headerKey = key};
     console.log($scope.headerKey)
  })

  $rootScope.goBack = function() {
    $ionicHistory.goBack();
    console.log('entered back')
  }
});
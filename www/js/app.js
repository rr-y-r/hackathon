(function(){
  'use strict';
  var module = angular.module('app', ['onsen']);

  module.controller('AppController', function($scope, $data) {
    $scope.doSomething = function() {
      setTimeout(function() {
        ons.notification.alert({ message: 'tapped' });
      }, 100);
    };
  });

  module.controller('DetailController', function($scope , $myData) {

    console.log($myData);

    // $http.get('http://hackathon.jelastic.elastx.net/getALLKTP.php'
    //  ).success(function(data){



       $scope.item = $myData;
      // $scope.item = function(selectedItem){
      //   console.log(tag_id);
      //   console.log(tag_id);
      //   console.log(selectedItem.tag_id);
      // }


  //  });
  });

  module.controller('TabbarController', function($scope){

  });




  module.controller('LoginController', function($scope,$location){

      $scope.doLogin = function(location){
         $location.update("/home");
       };

       $scope.doExit = function($rootScope){
          navigator.app.exitApp();
       }

      

  });

  module.controller('DBController',function($scope, $http){
    $http.get('http://hackathon.jelastic.elastx.net/dbtest.php'
     ).success(function(response){$scope.stat = response;});
  });

  module.controller('MasterController', function($scope, $myData, $http) {
    $http.get('http://hackathon.jelastic.elastx.net/getALLKTP.php'
     ).success(function(response){
        // /var selectedItem = response;
        $scope.items = response;

        $scope.showDetail = function(index) {
          var arrDat = {};

          arrDat.items = response;
        /*
        $http.get('http://hackathon.jelastic.elastx.net/getALLKTP.php'
       ).success(function(response){
          var selectedItem = $data.items[index];
          $data.selectedItem = selectedItem;
          $scope.navi.pushPage('detail.html', {title : selectedItem.title});

      });
  */
          var selectedItem = arrDat.items[index];
          $myData.NIK = selectedItem.NIK;
          $myData.tag_id = selectedItem.tag_id;
          $myData.nama = selectedItem.nama;
          arrDat.selectedItem = selectedItem;
          $scope.navi.pushPage('detail.html', selectedItem);

          
       
      };

    });
     /*
    $scope.items = $data.items;
    $scope.log($data.items);
    */
    
  });
/*

  module.factory('getALL', function($http) {
      var data = {};

      $http.get('http://hackathon.jelastic.elastx.net/dbtest.php').success(function(response) {
        data.items = response;
      });

      return data;
  });


*/
module.factory('$myData', function() {
      var data = {};

      return data;
  });
  module.factory('$data', function() {
      var data = {};

      data.items = [
          {
              title: 'Item 1 Title',
              label: '4h',
              desc: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
          },
          {
              title: 'Another Item Title',
              label: '6h',
              desc: 'Ut enim ad minim veniam.'
          },
          {
              title: 'Yet Another Item Title',
              label: '1day ago',
              desc: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
          },
          {
              title: 'Yet Another Item Title',
              label: '1day ago',
              desc: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
          }
      ];

      return data;
  });

})();


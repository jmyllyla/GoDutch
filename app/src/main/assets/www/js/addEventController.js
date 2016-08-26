

function MainController($scope){

  $scope.loadData = function () {
       $scope.travellers = JSON.parse(Database.getTravellers());
       $scope.participants=$scope.travellers;
       //alert($scope.travellers);
  };

  $scope.loadData();

  $scope.store = function(){
        Android.showToast("Storing");
        var event = $scope.event.name;
        var participants = JSON.stringify($scope.event.participants);
        var payer = ($scope.event.payer);
        var amount = ($scope.event.amount);
        alert(payer);
        Database.addEvent(participants, payer, event, amount );
        //window.history.back();
        window.location.href = "file:///android_asset/www/list.html";
  };

  $scope.hello = function(){
      Android.showToast("Cancel");
      window.location.href = "file:///android_asset/www/list.html";
  };

}

MainController.$inject = ['$scope'];
angular.module('app', []).controller('MainController', MainController);
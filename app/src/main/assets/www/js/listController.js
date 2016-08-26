function typeToInput(){

                 window.location.href = "file:///android_asset/www/index.html";
};

function ListController($scope){

  $scope.loadData = function () {
         $scope.events = JSON.parse(Database.getEvents());
         if( $scope.events || $scope.events.length>0){
                var firstEvent = $scope.events[0];
                var debtsFromEvents = debts($scope.events);
                $scope.debts=[];
                $scope.debts = _.flatten(_.values(debtsFromEvents));



         }


    };

    $scope.loadData();




}

ListController.$inject = ['$scope'];
angular.module('app', []).controller('ListController', ListController);
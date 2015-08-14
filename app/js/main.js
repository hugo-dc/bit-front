
var app = angular.module('Beenotes', []);

var ipc = require('ipc');

app.controller('MainController', function($scope) {
  $scope.title = "Personal Notes";
  $scope.welcome_vis = true;
  $scope.createn_vis = false;

  $scope.pgCreateNotebook = function() {
  };

  $scope.toggleVis = function(name) {
    if ( name == "main"  )
    {
      $scope.createn_vis = false;
      $scope.welcome_vis = true;
    }else {
      $scope.welcome_vis = false;
      $scope.createn_vis = true;
    }
  };

  $scope.createNotebook = function (name, desc) {
    var args = { "name": name,
                 "desc": desc };

    if (name == "" || desc == "" || name == null || desc == null)
    {
      $scope.message = "Provide both values";
    } else {
      ipc.send('create-notebook', args);
    }
  };

});

ipc.on('notebook-exists', function() {
  var main = document.getElementById("html");
  var sc = angular.element(main).scope();
  sc.$apply(function() {
    sc.message =  "Notebook already exists!";
  });
});


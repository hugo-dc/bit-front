
var app = angular.module('Beenotes', []);

var ipc = require('ipc');

app.controller('MainController', function($scope) {
  $scope.title = "Personal Notes";
  $scope.welcome_vis = true;
  $scope.createn_vis = false;
  $scope.current = "index";

  $scope.pgHome = function() {
    $scope.toggleVis('home');
  }

  $scope.pgCreateNotebook = function() {
    $scope.toggleVis('createn');
  };
  
  $scope.pgSearchNotebook = function() {
    $scope.toggleVis('search');
  };

  $scope.toggleVis = function(name) {
    if ( name == "home"  )
    {
      $scope.current = 'index';
      $scope.createn_vis = false;
      $scope.welcome_vis = true;
	  $scope.search_vis = false;
    } else if ( name == "search"  )
    {
      $scope.current = 'search';
      $scope.createn_vis = false;
      $scope.welcome_vis = false;
	  $scope.search_vis = true;
    }
	else {
      $scope.current = 'create';
      $scope.welcome_vis = false;
      $scope.createn_vis = true;
	  $scope.search_vis = false;
	  $scope.nb_name = "";
	  $scope.nb_desc = "";
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

  $scope.isActive = function(page) {
    if (page == $scope.current)
    {
      return true; 
    } else {
      return false;
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

ipc.on('notebook-ready', function() {
});


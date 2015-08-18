
var app = angular.module('Beenotes', []);

var ipc = require('ipc');

ipc.send('load-notebooks');

app.controller('MainController', function($scope) {
  $scope.title = "Personal Notes";
  $scope.loading_vis = true;
  $scope.welcome_vis = false;
  $scope.createn_vis = false;
  $scope.current = "index";
  $scope.lastNote = null;

  $scope.pgHome = function() {
    $scope.toggleVis('index');
  }

  $scope.pgCreateNotebook = function() {
    $scope.toggleVis('create');
  };
  
  $scope.pgSearchNotebook = function() {
    $scope.toggleVis('search');
  };

  $scope.openNotebook = function(name) {
    $scope.toggleVis("notebook");
    $scope.current = name;
  };

  $scope.toggleVis = function(name) {
    $scope.current = name;
    switch(name) {
      case "index":
        $scope.welcome_vis  = true;
        $scope.createn_vis  = false;
        $scope.loading_vis  = false;
        $scope.search_vis   = false;
        $scope.notebook_vis = false;
        break;
      case "create":
        $scope.welcome_vis  = false;
        $scope.createn_vis  = true;
        $scope.loading_vis  = false;
        $scope.search_vis   = false;
        $scope.notebook_vis = false;
        $scope.nb_name = "";
        $scope.nb_desc = "";
        break;
      case "loading":
        $scope.welcome_vis  = false;
        $scope.createn_vis  = false;
        $scope.loading_vis  = true;
        $scope.search_vis   = false;
        $scope.notebook_vis = false;
        break;
      case "search":
        $scope.welcome_vis  = false;
        $scope.createn_vis  = false;
        $scope.loading_vis  = false;
        $scope.search_vis   = true;
        $scope.notebook_vis = false;
        break;
      case "notebook":
        $scope.welcome_vis  = false;
        $scope.createn_vis  = false;
        $scope.loading_vis  = false;
        $scope.search_vis   = false;
        $scope.notebook_vis = true;
        break;
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

var getScope = function() {
  var main = document.getElementById("html");
  var sc = angular.element(main).scope();
  return sc;
};

ipc.on('notebook-exists', function() {
  var sc = getScope();
  sc.$apply(function() {
    sc.message =  "Notebook already exists!";
  });
});

ipc.on('notebook-ready', function(data) {
 var sc = getScope();
 var lastNB = data[data.length - 1];
 document.getElementById('note').innerHTML = lastNB.notes[lastNB.notes.length - 1].content;
 sc.$apply(function() {
   sc.notebooks = data;
   sc.toggleVis('notebook');
   sc.current = lastNB.id;
   sc.lastNote = lastNB.notes[lastNB.notes.length - 1];
 });
});

ipc.on('loaded-notebooks', function (data) {
  var sc = getScope();
  sc.$apply(function() {
    sc.notebooks = data;
    sc.toggleVis('index');
    if (sc.notebooks.length == 0) {
      sc.message = "You can start creating your first notebook!";
    }else {
      sc.message = "You have a total of " + sc.notebooks.length + " notebooks!"
    }
  });
});



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
    $scope.markdown = "";
    $scope.nbook_ix = null;
    $scope.nbtitle = "";

  $scope.pgHome = function() {
    $scope.toggleVis('index');
  }

  $scope.pgCreateNotebook = function() {
    $scope.toggleVis('create');
  };
  
  $scope.pgSearchNotebook = function() {
    $scope.toggleVis('search');
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
	$scope.edit_vis     = false;
        break;
      case "create":
        $scope.welcome_vis  = false;
        $scope.createn_vis  = true;
        $scope.loading_vis  = false;
        $scope.search_vis   = false;
        $scope.notebook_vis = false;
	$scope.edit_vis     = false;
        $scope.nb_name = "";
        $scope.nb_desc = "";
        break;
      case "loading":
        $scope.welcome_vis  = false;
        $scope.createn_vis  = false;
        $scope.loading_vis  = true;
        $scope.search_vis   = false;
        $scope.notebook_vis = false;
	$scope.edit_vis     = false;
        break;
      case "search":
        $scope.welcome_vis  = false;
        $scope.createn_vis  = false;
        $scope.loading_vis  = false;
        $scope.search_vis   = true;
        $scope.notebook_vis = false;
	$scope.edit_vis     = false;
        break;
      case "notebook":
        $scope.welcome_vis  = false;
        $scope.createn_vis  = false;
        $scope.loading_vis  = false;
        $scope.search_vis   = false;
        $scope.notebook_vis = true;
	$scope.edit_vis     = false;
        break;
    case "edit":
	$scope.welcome_vis  = false;
        $scope.createn_vis  = false;
        $scope.loading_vis  = false;
        $scope.search_vis   = false;
        $scope.notebook_vis = false;
	$scope.edit_vis     = true;
	break;
    }
  };

    $scope.createNotebook = function (name, desc) {
	$scope.toggleVis("loading");
	var args = { "name": name,
                     "desc": desc };

	if (name == "" || desc == "" || name == null || desc == null)
	{
	    $scope.message = "Provide both values";
	} else {
	    ipc.send('create-notebook', args);
	}
    };
    
    $scope.openNotebook = function(nb_id) {
	$scope.toggleVis("loading");
	var args = { "id" : nb_id };
	ipc.send('open-notebook', args);
    };

  $scope.isActive = function(page) {
    if (page == $scope.current)
    {
      return true; 
    } else {
      return false;
    }
  };

    // Notes menu
    $scope.mnEdit = function() {
	var curr = $scope.current;
	$scope.toggleVis('edit');
	$scope.current = curr;
	
    }

    $scope.mnViewHtml = function() {
	console.log("mnViewHtml\n==========\n");
	var curr = $scope.current;
	console.log("current: " + $scope.current);
	
	var args = { "nbix"    : $scope.nbook_ix,
		     "ntix"    : $scope.note_ix,
		     "content" : null,
		     "title"   : null
		   };
	var change = false;
	
	if ($scope.markdown != $scope.lastNote.content) {
	    args.content = $scope.markdown;
	    console.log("Markdown changed!");
	    change = true;
	}
	if ($scope.nbtitle != $scope.lastNote.title) {
	    args.title = $scope.nbtitle;
	    console.log(args.nbtitle);
	    console.log("Title changed!");
	    change = true;
	}
	
	if (change){
	    $scope.toggleVis('loading');
	    $scope.current = curr;
	    console.log("Calling Update Backend proces...");
	    console.log("Using args: nbix = " + $scope.nbook_ix + " note_ix = " + $scope.note_ix);
	    ipc.send('update-note', args);
	}else {
	    console.log("Markdown not changed!");
	    $scope.toggleVis('notebook');
	    $scope.current = curr;
	}
    }
});

var getScope = function() {
  var main = document.getElementById("html");
  var sc = angular.element(main).scope();
  return sc;
};

ipc.on('notebook-exists', function() {
    var sc = getScope();
    sc.$apply(function() {
	sc.toggleVis("create");
	sc.message =  "Notebook already exists!";
    });
});

ipc.on('notebook-ready', function(data) {
    var sc = getScope();
    var lastNB = data.nbs[data.nb_ix];
    document.getElementById('note').innerHTML = lastNB.notes[data.nt_ix].html;
    sc.$apply(function() {
	sc.notebooks = data.nbs;
	sc.toggleVis('notebook');
	sc.current = lastNB.id;
	sc.markdown = lastNB.notes[data.nt_ix].content;
	sc.nbtitle  = lastNB.notes[data.nt_ix].title;
	sc.lastNote = lastNB.notes[data.nt_ix];
	sc.nbook_ix = data.nb_ix;
	sc.note_ix  = data.nt_ix;
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


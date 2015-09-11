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
    $scope.action = null;
    $scope.year = null;
    $scope.month = null;
    $scope.day = null;
    $scope.navigation = null;
    $scope.notebook = null;

    $scope.navitem = null;

    $scope.pgHome = function() {
	$scope.message = "";
	$scope.toggleVis('index');
    };

  $scope.pgCreateNotebook = function() {
    $scope.toggleVis('create');
  };
  
  $scope.pgSearchNotebook = function() {
    $scope.toggleVis('search');
  };


    $scope.toggleVis = function(name) {
	$scope.current = name;
	
        $scope.welcome_vis  = false;
        $scope.createn_vis  = false;
        $scope.loading_vis  = false;
        $scope.search_vis   = false;
        $scope.notebook_vis = false;
	$scope.edit_vis     = false;
	$scope.ntcreate_vis = false;
	$scope.navnotes_vis = false;

	if (name == "index")  $scope.welcome_vis = true;
        if (name == "create") {
	    $scope.createn_vis  = true;
            $scope.nb_name = "";
            $scope.nb_desc = "";
	}
	if (name == "loading")  $scope.loading_vis  = true;
	if (name == "search")   $scope.search_vis   = true;
	if (name == "notebook") $scope.notebook_vis = true;
	if (name == "edit")     $scope.edit_vis     = true;
	if (name == "ntcreate") $scope.ntcreate_vis = true;
	if (name == "navnotes") $scope.navnotes_vis = true;
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

    $scope.isFirstNote = function() {
	if ($scope.note_ix == 0)
	    return true;
	return false;
    };

    $scope.isLastNote = function ()
    {
	console.log($scope.nbook_ix);
	if ($scope.note_ix == ($scope.notebooks[$scope.nbook_ix].notes.length - 1))
	    return true;
	return false;
    };

    // Navigate notes
    $scope.getNotes = function(year, month, day)
    {
	var current = $scope.current;
	var notes = [];
	var months = ["January", "February", "March",
		      "April",   "May"     , "June",
		      "July",    "August",   "September",
		      "October", "November", "December"];
	
	$scope.navigation = $scope.title + " - Notes for " + months[month - 1] + " " + day + ", " + year;
	$scope.toggleVis("navnotes");
	$scope.current = current;

	for (var i = 0; i <= $scope.notebook.notes.length - 1; i++)
	{
	    if ($scope.notebook.notes[i].year  == year  &&
		$scope.notebook.notes[i].month == month &&
		$scope.notebook.notes[i].day   == day )
		notes.push({ix: i,
			    note: $scope.notebook.notes[i]});
	}
	$scope.navitem = notes;
    }

    $scope.getDays = function(year, month)
    {
	var current = $scope.current;
	$scope.toggleVis("navdays");
	$scope.current = current;
    }

    $scope.getMonths = function(year)
    {
	var current = $scope.current;
	$scope.toggleVis("navyear");
	$scope.current = current;
    }

    $scope.getYears = function()
    {
	var current = $scope.current;
	$scope.toggleVis("navnb");
	$scope.current = current;
    }

    // Notes menu
    $scope.callNote = function(nb,ix) {
	console.log(nb);
	console.log(ix);
	var nb = $scope.notebooks[nb];
	console.log(nb);
	$scope.markdown = nb.notes[ix].content;
	$scope.nbtitle  = nb.notes[ix].title;
	$scope.year     = nb.notes[ix].year;
	$scope.month    = nb.notes[ix].month;
	$scope.day      = nb.notes[ix].day;
	$scope.note_ix  = ix;
	document.getElementById('note').innerHTML = nb.notes[ix].html;
	$scope.message ="";
    }
    
    $scope.mnPrev = function() {
	if ($scope.note_ix > 0)
	    $scope.callNote($scope.nbook_ix, $scope.note_ix - 1);	    
    }

    $scope.mnNext = function(){
	if ($scope.note_ix < $scope.notebooks[$scope.nbook_ix].notes.length) 
	    $scope.callNote($scope.nbook_ix, $scope.note_ix + 1);	    
    }
    
    $scope.mnCreate = function() {
	var curr = $scope.current;
	$scope.tmptitle    = $scope.nbtitle;
	$scope.tmpmarkdown = $scope.markdown;
	
	$scope.nbtitle = "";
	$scope.markdown = "";
	$scope.action = "create_note";	
	$scope.toggleVis('edit');

	$scope.current = curr;
	$scope.message = "";
    };
    
    $scope.mnEdit = function() {
	var curr = $scope.current;
	$scope.action = "update_note";
	$scope.toggleVis('edit');
	$scope.current = curr;
	$scope.message = "";
    };

    // Thi function is used to CREATE or UPDATE a note
    $scope.mnViewHtml = function() {
	var curr = $scope.current;
	console.log("mnViewHtml\n==========\n");
	console.log("current: " + $scope.current);
	console.log("action: " + $scope.action);
	
	if ($scope.action == "create_note") {
	    if ($scope.nbtitle == "" && $scope.markdown == "") {
		$scope.message = "Provide a note title and content!";
		return;
	    }
	    if ( $scope.nbtitle == "") {
		$scope.message = "Provide a valid title!";
		return;
	    }
	    if ($scope.markdown == "") {
		$scope.message = "Note is empty!";
		return;
	    }
	    console.log("Create note...");
	    var args = { "title" : $scope.nbtitle,
			 "content" : $scope.markdown,
			 "nbix" : $scope.nbook_ix,
		       };
	    console.log("Calling `Create Note` backend process...");
	    ipc.send('create-note', args);
	}else {
	    console.log("Update note...");
	    
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
	sc.toggleVis("create");
	sc.message =  "Notebook already exists!";
    });
});

// This event is called when a new notebook is created
ipc.on('notebook-ready', function(data) {
    var sc = getScope();
    var lastNB = data.nbs[data.nb_ix];
    document.getElementById('note').innerHTML = lastNB.notes[data.nt_ix].html;
    sc.$apply(function() {
	sc.notebooks = data.nbs;
	sc.toggleVis('notebook');
	sc.notebook = lastNB;
	sc.current = lastNB.id;
	sc.title   = lastNB.name;
	sc.markdown = lastNB.notes[data.nt_ix].content;
	sc.nbtitle  = lastNB.notes[data.nt_ix].title;
	sc.year     = lastNB.notes[data.nt_ix].year;
	sc.month    = lastNB.notes[data.nt_ix].month;
	sc.day      = lastNB.notes[data.nt_ix].day;
	sc.lastNote = lastNB.notes[data.nt_ix]; // TODO: Fix
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


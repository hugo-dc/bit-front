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

    $scope.months = ["January", "February", "March",
		     "April",   "May"     , "June",
		     "July",    "August",   "September",
		     "October", "November", "December"];
    
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
	if ($scope.note_ix == ($scope.notebooks[$scope.nbook_ix].notes.length - 1))
	    return true;
	return false;
    };

    $scope.setNavTitle = function(title) {
	$scope.navigation = "Notes for " + title + " [Notebook: " + $scope.title + "]";
    }

    // Navigate notes
    $scope.getNotes = function(year, month, day)
    {
	var current = $scope.current;
	var notes = [];

	$scope.navyear = null;
	$scope.navmonth = null;

	$scope.setNavTitle($scope.months[month - 1] + " " + day + ", " + year);
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
	$scope.toggleVis("navnotes");
	$scope.setNavTitle($scope.months[month - 1] + ", " + year);
	$scope.current = current;
	var days = [];

	$scope.navyear = null;
	$scope.navitem = null;
	$scope.navall  = null;

	for (var i = 0; i <= $scope.notebook.notes.length - 1; i++ ){
	    if ($scope.notebook.notes[i].year == year &&
		$scope.notebook.notes[i].month == month ){
		var ex = false;
		for (var j=0 ; j < days.length ; j++ ){
		    if ($scope.notebook.notes[i].day == days[j].day ) {
			ex = true
			break;
		    }
		}
		if (!ex) days.push({y : year,
				   m : month,
				   day : $scope.notebook.notes[i].day});
	    }
	    if ($scope.notebook.notes[i].year > year ||
		$scope.notebook.notes[i].month > month) break;
	}
	$scope.navmonth = days;
	$scope.current = current;
    }

    $scope.getMonths = function(year)
    {
	var current = $scope.current;
	$scope.toggleVis("navnotes");
	$scope.setNavTitle(year);
	$scope.current = current;

	$scope.navmonth = null;
	$scope.navitem  = null;
	$scope.navall   = null;

	var months = [];
	for (var i=0 ; i < $scope.notebook.notes.length; i++){
	    if ($scope.notebook.notes[i].year == year) {
		var ex = false;
		for (var j=0; j< months.length ; j++ ) {
		    if ($scope.notebook.notes[i].month == months[j].month){
			ex = true
			break;
		    }
		}
		if (!ex) months.push({y: year,
				      month: $scope.notebook.notes[i].month,
				      name:  $scope.months[$scope.notebook.notes[i].month - 1]});
	    }
	    if ($scope.notebook.notes[i].year > year) break;
	}
	$scope.navyear = months;
    }

    $scope.getYears = function(){
	var current = $scope.current;
	$scope.toggleVis("navnotes");
	$scope.setNavTitle("");
	$scope.current = current;

	$scope.navmonth = null;
	$scope.navitem  = null;
	$scope.navyear  = null;
	
	var years = [];

	for (var i=0; i < $scope.notebook.notes.length; i++ ) {
	    var ex = false;
	    for (var j=0 ; j < years.length ; j++){
		if ($scope.notebook.notes[i].year == years[j]) {
		    ex = true;
		    break;
		}
	    }
	    if(!ex) years.push($scope.notebook.notes[i].year);
	}
    	$scope.navall = years;
    }

    // Open Note

    $scope.openNote = function(ix) {
	var curr = $scope.current;
	$scope.toggleVis("notebook");
	$scope.callNote($scope.nbook_ix, ix);
	$scope.current = curr;
    }

    // Notes menu
    $scope.callNote = function(nb,ix) {
	var nb = $scope.notebooks[nb];
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

    $scope.btnHeader = function() {
	var tx = document.getElementById("editor");
	var newVal = "";

	if (tx.selectionStart != undefined) {
	    var st = tx.selectionStart;
	    var en = tx.selectionEnd;
	    var added = 0;

	    // If no text is selected, the curren line
	    // will be a title
	    if (st == en) {
		var ch = tx.value.substring(st -2, st -1);
		while(ch != '\n') {
		    st--;
		    ch = tx.value.substring(st -2, st -1);
		}
		st --;
	    }
	    newVal = tx.value.substring(0,st);
	    // If the selection is not the start of line
	    // two lines will be created
	    if(tx.value.substring(st - 2, st -1) != '\n'){
		newVal = newVal + "\n\n# " + tx.value.substring(st, en);
		added = 4;
	    }else{
		newVal = newVal + "# " + tx.value.substring(st, en);
		added = 2;
	    }
	    if (tx.value.length > en )
		newVal = newVal + tx.value.substring(en, tx.value.length - 1);

	    tx.value = newVal;
	    $scope.markdown = newVal;
	    tx.setSelectionRange(en + added, en + added);
	    tx.focus();
	}
	   
    };

  
    $scope.btnBold = function() {
	
	var tx = document.getElementById("editor");
	var newVal = "";
	
	if (tx.selectionStart != undefined){
	    var st = tx.selectionStart;
	    var en = tx.selectionEnd;
	    if (st != en ) {
		newVal = tx.value.substring(0,st);
		newVal = newVal + "**" + tx.value.substring(st, en) + "**";
		if (tx.value.length > en)
		    newVal = newVal + tx.value.substring(en, tx.value.length -1);
		tx.value = newVal;
		$scope.markdown = newVal;
		tx.setSelectionRange(en + 4, en + 4);
		tx.focus();
	    }else{
		$scope.message("No text were selected");
	    }
	    
	}
    };


    // Thi function is used to CREATE or UPDATE a note
    $scope.mnViewHtml = function() {
	var curr = $scope.current;
	
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
	    var args = { "title" : $scope.nbtitle,
			 "content" : $scope.markdown,
			 "nbix" : $scope.nbook_ix,
		       };
	    ipc.send('create-note', args);
	}else {
	    var args = { "nbix"    : $scope.nbook_ix,
			 "ntix"    : $scope.note_ix,
			 "content" : null,
			 "title"   : null
		       };
	    var change = false;
	    if ($scope.markdown != $scope.lastNote.content) {
		args.content = $scope.markdown;
		change = true;
	    }
	    if ($scope.nbtitle != $scope.lastNote.title) {
		args.title = $scope.nbtitle;
		change = true;
	    }
	
	    if (change){
		$scope.toggleVis('loading');
		$scope.current = curr;
		ipc.send('update-note', args);
	    }else {
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


	

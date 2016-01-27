
var app = angular.module('Bitacorapp', []);
var ipc = require('ipc');
var SERVER = "http://localhost:3000/";

app.controller('MainController', function($scope, $http) {
    $http.get(SERVER + "api-ready").success(function(data) {
	$scope.message = data.messageR;
    }).error(function (data) {
	$scope.message = "ERROR!: API is not ready!";
    });
   
    $http.get(SERVER + "get-notebooks").success(function(data){
	$scope.toggleVis('index');
	$scope.notebooks = data;
	if (data.length === 0) {
	    $scope.message = "You can start creating your first notebook!";
	}else{
	    $scope.message = "You have a total of " + data.length + " notebooks!";   
	}
    });
    
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
    $scope.edit_lnk = false;
    $scope.st = null;
    $scope.en = null;
    $scope.link = "";
    $scope.lnk_title ="";
    $scope.debug = "debug";
    $scope.delete_note = false;

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
	    // ipc.send('create-notebook', args);
	    $http.get(SERVER + 'create-notebook/' + name + '/' + desc).success(function(data){

		if (data.successR == false) {
		    $scope.toggleVis("create");
		    $scope.message = data.messageR;
		}else{
		    $scope.toggleVis('notebook');
		    $http.get(SERVER + 'get-notebooks').success(function(data){
			$scope.notebooks = data;
		    $http.get(SERVER + 'get-note-by-nb-name/' + name + '/1').success(function(data){
			document.getElementById('note').innerHTML = data.nHtml;
			$scope.current = data.parentId;
			$scope.title   = name;
			$scope.markdown = data.nContent;
			$scope.nbtitle  = data.nTitle;
			$scope.year     = data.ntYear;
			$scope.month    = data.ntMonth;
			$scope.day      = data.ntDay;
			$scope.lastNote = data.ntId;
		    });			
		    });
		}
	    });
	}
    };

    $scope.getLastNote = function (nbid) {
	$http.get(SERVER + "get-last-note/" + nbid).success(function(data) {
	    $scope.toggleVis('notebook');
	    $scope.markdown = data.nContent;
	    document.getElementById('note').innerHTML = data.nHtml;
	    $scope.year     = data.ntYear;
	    $scope.month    = data.ntMonth;
	    $scope.day      = data.ntDay;
	    $scope.nbtitle  = data.nTitle;
	    $scope.lastNoteId = data.ntId;
	    $scope.note_ix    = data.ntId;
	    $scope.current    = $scope.nbook_ix;
	});	
    };
    
    $scope.openNotebook = function(nb_name) {
	$scope.message = "Loading...";
	$scope.toggleVis("loading");

	$http.get(SERVER + "get-notebook-by-name/"+ nb_name).success(function(data) {
	    $scope.notebook = data;
	    $scope.current  = data.nbId;
	    $scope.title    = data.nbName;
	    $scope.nbook_ix = data.nbId;
	    $scope.getLastNote(data.nbId);
	    $scope.message = "";
	});
    };

    $scope.isActive = function(page) {
	if (page == $scope.current)
	    return true; 
	return false;
    };

    $scope.isFirstNote = function() {
	if ($scope.note_ix === 1)
	    return true;
	return false;
    };

    $scope.isLastNote = function ()
    {
	if ($scope.note_ix === $scope.lastNoteId)
	    return true;
	return false;
    };

    $scope.setNavTitle = function(title) {
	$scope.navigation = "Notes for " + title + " [" + $scope.title + "]";
    }

    // Navigate notes
    $scope.getNotes = function(year, month, day){
	var current = $scope.current;
	var notes = [];
	$scope.year = year;
	$scope.month = month;
	$scope.day = day;
	$scope.navyear = null;
	$scope.navmonth = null;

	$scope.setNavTitle($scope.months[month - 1] + " " + day + ", " + year);
	$scope.toggleVis("navnotes");
	$scope.current = current;

	$http.get(SERVER + "get-notes-by-day/" + $scope.nbook_ix + "/" + year + "/" + month + "/" + day).success(function(data){
	    $scope.navitem = data;
	});
    };

    $scope.getDays = function(year, month){
	var current = $scope.current;
	$scope.year = year;
	$scope.month = month;
	$scope.toggleVis("navnotes");
	$scope.setNavTitle($scope.months[month - 1] + ", " + year);
	$scope.current = current;
	var days = [];

	$scope.navyear = null;
	$scope.navitem = null;
	$scope.navall  = null;
	$http.get(SERVER + "get-days/" + $scope.nbook_ix + "/" + year + "/" + month).success(function(data){
	    $scope.navmonth = data;
	})
	$scope.current = current;
    };

    $scope.getMonths = function(year){
	var current = $scope.current;
	$scope.year = year;
	$scope.toggleVis("navnotes");
	$scope.setNavTitle(year);
	$scope.current = current;
	$scope.searchYear = year;

	$scope.navmonth = null;
	$scope.navitem  = null;
	$scope.navall   = null;

	$http.get(SERVER + "get-months/" + $scope.nbook_ix + "/" + year).success(function(data){
	    $scope.navyear = data;
	});
        $scope.current = current;
    };

    $scope.getYears = function(){
	var current = $scope.current;
	$scope.toggleVis("navnotes");
	$scope.setNavTitle("");
	$scope.current = current;

	$scope.navmonth = null;
	$scope.navitem  = null;
	$scope.navyear  = null;

	$http.get(SERVER + "get-years/" + $scope.nbook_ix).success(function(data){
	    $scope.navall = data;
	});
    }

    // Open Note
    $scope.openNote = function(ix) {
	console.log("Function openNote");
	var curr = $scope.current;
	$scope.toggleVis("notebook");
	console.log("Calling note...");
	console.log($scope.nbook_ix);
	console.log(ix);
	$scope.callNote($scope.nbook_ix, ix);
	$scope.current = curr;
    }

    // Notes menu
    $scope.noteReceived = function(data)
    {
	$scope.toggleVis('notebook');
	$scope.markdown = data.nContent;
	document.getElementById('note').innerHTML = data.nHtml;
	$scope.year = data.ntYear;
	$scope.month = data.ntMonth;
	$scope.day   = data.ntDay;
	$scope.nbtitle = data.nTitle;
	$scope.note_ix = data.ntId;
	$scope.current = data.parentId;	
    }
    
    $scope.callNote = function(nb,ix) {
	// Get Note using WS
//	$scope.note_ix  = ix;
	$http.get(SERVER + "get-note/" + nb + "/" + ix).success($scope.noteReceived);
	$scope.message ="";
    }

    $scope.mnPrev = function() {
	if ($scope.note_ix > 0){
	    $http.get(SERVER + "get-prev/" + $scope.nbook_ix + "/" + $scope.note_ix).success($scope.noteReceived);
	}
    }

    $scope.mnNext = function(){
	$scope.callNote($scope.nbook_ix, $scope.note_ix + 1);
	$http.get(SERVER + "get-next/" + $scope.nbook_ix + "/" + $scope.note_ix).success($scope.noteReceived);
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
	$scope.lastTitle = $scope.nbtitle;
	$scope.lastContent = $scope.markdown;
	console.log("Editing note...");
    };

    $scope.mnDelete = function() {
	console.log("Delete note?");
	$scope.delete_note = true;
    }

    $scope.delCancel = function() {
	$scope.delete_note = false;
    }

    $scope.delAccept = function() {
	$scope.delete_note = false;
	$scope.message = "Note deleted!";
    }

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

    $scope.surround = function(surr) {
	var tx = document.getElementById("editor");
	var added = surr.length * 2;
	var newVal = "";
	$scope.message = "";
	
	if (tx.selectionStart != undefined){
	    var st = tx.selectionStart;
	    var en = tx.selectionEnd;
	    if (st != en ) {
		newVal = tx.value.substring(0,st);
		newVal = newVal + surr + tx.value.substring(st, en) + surr;
		if (tx.value.length > en)
		    newVal = newVal + tx.value.substring(en, tx.value.length -1);
		tx.value = newVal;
		$scope.markdown = newVal;
		tx.setSelectionRange(en + added, en + added);
		tx.focus();
	    }else{
		tx.setSelectionRange(st, st);
		tx.focus();
		$scope.message = "No text were selected";
	    }
	}
    };

    $scope.btnItalics = function() {
	$scope.surround("_");
    }
  
    $scope.btnBold = function() {
	$scope.surround("**");
    }

    $scope.btnLink = function() {
	$scope.edit_lnk = true;
	var tx = document.getElementById("editor");
	var ip = document.getElementById("lnk_title");
	
	$scope.st = tx.selectionStart;
	$scope.en = tx.selectionEnd;

	ip.focus();
	
    }

    $scope.btnCode = function () {
	$scope.code = true;
	var tx = document.getElementById("editor");
	$scope.st = tx.selectionStart;
	$scope.en = tx.selectionEnd;
    }

    $scope.btnSShot = function () {
	var tx = document.getElementById("editor");
	$scope.st = tx.selectionStart;
	$scope.en = tx.selectionEnd;
	var args = {};
	console.log('Screenshot...');
	ipc.send('capture-screenshot', args);
    }

    // This function is called by the backend
    $scope.addScreenshot = function (ssid) {
	var newVal = "";
	var tx = document.getElementById("editor");
	var added = 0;
	if ($scope.st != undefined) {
	    newVal = tx.value.substring(0, $scope.st);
	    newVal = newVal + "![](../bin/images/" + ssid + ".png) ";
	    added = 39;
	}
	newVal = newVal + tx.value.substring($scope.en, tx.value.length -1);
	tx.value = newVal;
	$scope.markdown = newVal;
	tx.setSelectionRange($scope.en + added, $scope.en + added);
	tx.focus();
	$scope.st = null;
	$scope.en = null;
    }

    $scope.cdAccept = function() {
	$scope.code = false;
	var newVAL = "";
	var tx = document.getElementById("editor");
	var added = 0;
	var lg = document.getElementById("lang");
	var cd = document.getElementById("code");

	if ($scope.st != undefined) {
	    newVal = tx.value.substring(0, $scope.st);
	    newVal = newVal + "\n```" + lg.value + "\n" + cd.value + "\n```";
	    added = lg.value.length + cd.value.length + 9;
	}
	newVal = newVal + tx.value.substring($scope.en, tx.value.length -1);
	tx.value = newVal;
	$scope.markdown = newVal;
	tx.setSelectionRange($scope.en + added, $scope.en + added);
	tx.focus();
	cd.value = "";
	$scope.st = null;
	$scope.en = null;
    }

    $scope.cdCancel = function () {
	$scope.code = false;
	var cd = document.getElementById("code");
	cd.value = "";
    }

    $scope.lnkAccept = function() {
	var newVal = "";
	var tx = document.getElementById("editor");
	var added = 0;
	
	if ($scope.st != undefined) {
	    newVal = tx.value.substring(0, $scope.st);
	    if($scope.lnk_title != undefined && $scope.lnk_title != ""){
		console.log($scope.lnk_title);
		newVal = newVal + "[" + $scope.lnk_title + "](" + $scope.link + ") ";
		added = $scope.lnk_title.length + $scope.link.length;
	    }else {
		newVal = newVal + "[" + $scope.link + "](" + $scope.link + ")";
		added = $scope.link.length * 2;
	    }
	    added+= 5;
	    newVal = newVal + tx.value.substring($scope.en, tx.value.length - 1);
	    tx.value = newVal;
	    $scope.markdown = newVal;
	}
	$scope.edit_lnk = false;
	tx.setSelectionRange($scope.en + added, $scope.en + added);
	tx.focus();
	$scope.link = "";
	$scope.lnk_title = "";
	$scope.st = null;
	$scope.en = undefined;
	
    };

    $scope.lnkCancel = function () {
	$scope.edit_lnk = false;
    };

    $scope.List = function(ind) {
	var tx = document.getElementById("editor");
	var newVal = "";
	var added = 2 + ind.length;

	if (tx.selectionStart != undefined) {
	    var st = tx.selectionStart;
	    var en = tx.selectionEnd;
	    if(st == en){
		var ch = tx.value.substring(st -1, st);

		while(ch != '\n') {
		    console.log("In WHILE");
		    st--;
		    if( st < 0) {
			st = 0;
			break;
		    }
		    ch = tx.value.substring(st-1, st);
		}
	    }
	    
	    newVal = tx.value.substring(0, st);
	    newVal = newVal + "\n" + ind + "  ";
	    console.log(newVal);
	    	
	    if(tx.value.length > en){
		newVal = newVal + tx.value.substring(en, tx.value.length - 1);
	    }
	    tx.value = newVal;
	    $scope.markdown = newVal;
	    tx.setSelectionRange(en+added, en+added);
	    tx.focus();
	}
    };

    $scope.btnUList = function() {
	$scope.List("*");
    };

    $scope.btnOList = function() {
	$scope.List("1.");
    };
    
    // This function is triggered when a change is made in the Notes Editor
    $scope.editorChange = function(){
	// TODO: Implement function
    };
    
    // Thi function is used to CREATE or UPDATE a note
    $scope.mnViewHtml = function() {
	console.log("View HTML");
	var curr = $scope.current;
	
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
	if ($scope.action == "create_note") {
	    $scope.toggleVis('loading');
	    $scope.message = "Creating note...";
	    $scope.current = curr;
	    var req = {
		method: 'POST',
		url: SERVER + 'create-note',
		headers: {
		    'Content-Type' : undefined
		},
		data: {
		    crNbId   : $scope.nbook_ix,
		    crTitle : $scope.nbtitle,
		    crContent : $scope.markdown
		}
	    }
	    $http(req).then(function(result){
		$scope.message = result.data.messageR;
		if(result.data.successR){
		    $scope.toggleVis('notebook');
		    $scope.getLastNote($scope.nbook_ix);
		}
	    });
	}else {
	    var change = false;
	    if ($scope.markdown != $scope.lastContent || $scope.nbtitle != $scope.lastTitle) {
		change = true;
	    }
	    console.log("Change...");
	    if (change){
		$scope.toggleVis('loading');
		$scope.message = "Updating note...";
		$scope.current = curr;
		var req = {
		    method: 'POST',
		    url: SERVER + 'update-note',
		    headers: {
			'Content-Type' : undefined
		    },
		    data: {
			updId    : $scope.note_ix,
			updTitle : $scope.nbtitle,
			updContent : $scope.markdown
		    }
		};
		
		$http(req).then(function(result){
		    $scope.message = result.data.messageR;
		    if(result.data.successR){
			console.log("Entering...");
			$scope.openNote($scope.note_ix);
		    }		    
		}, function(response){
		    console.log("ERROR:");
		    console.log(JSON.stringify(response));
		    $scope.message = response.data;
		    $scope.toggleVis('notebook');
		    
		});
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

/*
ipc.on('notebook-exists', function() {
    var sc = getScope();
    sc.$apply(function() {
	sc.toggleVis("create");
	sc.message =  "Notebook already exists!";
    });
});
*/

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
	sc.debug    = data.debug;
    });
});
// Screenshot taken
ipc.on('screenshot', function(data) {
    var sc = getScope();
    sc.$apply(function() {
	sc.addScreenshot(data.ssid);
    });
});

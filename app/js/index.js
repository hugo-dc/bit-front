/************************************************************************
* Author: Hugo De la cruz
* August 2015 - 2016
*------------------------------------------------------------------------
* All App is contained in the MainController
* In this controller the following Function Categories exists:
*
*     - Initialization Logic
*     - Main Menu Logic
*     - Toggle Visualization
*     - Create new Notebook
*     - UI Functions
*     - Node Address Functions
*     - Notes Main Menu
*     - Notes Main Menu Helpers
*     - Notes Inferior Menu
*     - Notes Inferior Menu Helpers
*     - Backend Functions
*************************************************************************/
var app = angular.module('Bitacorapp', []);
var ipc = require('ipc');

var dev = true;

if (dev)
    var SERVER = "http://localhost:3001/";
else
    var SERVER = "http://localhost:3000/";

app.controller('MainController', function($scope, $http) {

    // Global Variables
    $scope.title = "Personal Notes";
    $scope.loading_vis = true;
    $scope.welcome_vis = false;
    $scope.createn_vis = false;
    $scope.current = "index";
    $scope.lastNoteId = null;
    $scope.firstNoteId = null;
    $scope.nbook_ix = null;
    $scope.note_ix = 0;
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
//    $scope.link = "";
//    $scope.lnk_title ="";
    $scope.debug = dev;
    $scope.delete_note = false;
    $scope.favorite = false; // Current note is favorite?
    $scope.navitem = null;
    $scope.saveMode = false;
    $scope.save_edit = "Edit";
    

    $scope.months = ["January", "February", "March",
		     "April",   "May"     , "June",
		     "July",    "August",   "September",
		     "October", "November", "December"];

    /*-------------------------------------------------------------------*
    /* Initialization Logic
    /*-------------------------------------------------------------------*/    
    $scope.initializeServer = function() {
	$http.get(SERVER + "api-ready").success(function(data) {
	    $scope.message = data.messageR;
	    $scope.initializeNotebooks();
	}).error(function (data) {
	    $scope.message = "ERROR: Server cannot be started please close BitacorApp and try again.";
	});	
    }


    $scope.initializeNotebooks = function () {
	$http.get(SERVER + "get-notebooks").success(function(data){
	    $scope.toggleVis('index');
	    $scope.notebooks = data;
	    if (data.length === 0) {
		$scope.message = "You can start creating your first notebook!";
	    }else{
		$scope.message = "You have a total of " + data.length + " notebooks!";   
	    }
	});
    }
    
    $scope.initializeApp = function() {
	$scope.message = "Connecting to backend server...";
	$scope.initializeServer();
    }

    /*-------------------------------------------------------------------*
    /* Main Menu Logic
    /*-------------------------------------------------------------------*/    
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

    /*-------------------------------------------------------------------*
      Toggle Visualization
      -------------------------------------------------------------------*/
    $scope.toggleVis = function(name) {
	$scope.current = name;
	
        $scope.welcome_vis  = false;
        $scope.createn_vis  = false;
        $scope.loading_vis  = false;
        $scope.search_vis   = false;
        $scope.notebook_vis = false;
	$scope.navnotes_vis = false;

	switch(name){
	case "index":
	    $scope.welcome_vis = true;
	    break;
	case "create":
	    $scope.createn_vis = true;
	    $scope.nb_name = "";
	    $scope.nb_desc = "";
	    break;
	case "loading":
	    $scope.loading_vis  = true;
	    break;
	case "search":
	    $scope.search_vis   = true;
	    break;
	case "notebook":
	    $scope.updateFav();
	    $scope.notebook_vis = true;
	    break;
	case "ntcreate":
	    $scope.ntcreate_vis = true;
	    break;
	case "navnotes":
	    $scope.navnotes_vis = true;
	    break
	}
    };

    /*-------------------------------------------------------------------*
      Notebook Management Logic
      -------------------------------------------------------------------*/
    $scope.createNotebook = function (name, desc) {

	var args = { "name": name,
                     "desc": desc };

	if (name == "" || desc == "" || name == null || desc == null)
	{
	    $scope.message = "Provide both values";
	} else {
	    $http.get(SERVER + 'create-notebook/' + name + '/' + desc).success(function(data){
		if (data == null) {
		    $scope.message = "Please set different title";
		}else{
		    $scope.toggleVis("loading");		    
		    $scope.nbook_ix = data.nbId;
		    $scope.toggleVis('notebook');
		    $http.get(SERVER + 'get-notebooks').success(function(data){
			$scope.notebooks = data;
			$scope.getLastNote($scope.nbook_ix);
		    });
		}
	    });
	}
    };

    $scope.getFirstNoteId = function (nbid) {
	console.log(nbid);
	$http.get(SERVER + "get-first-note/" + nbid).success(function(data) {
	    console.log("Success");
	    console.log(JSON.stringify(data));
	    if(data != null)
	    {
		console.log(data.ntId);
		$scope.firstNoteId = data.ntId;
		return data.ntId;
	    }else{
		return -1;
	    }
	});
    }
    
    $scope.getLastNote = function (nbid) {
	$http.get(SERVER + "get-last-note/" + nbid).success(function(data) {
	    $scope.toggleVis('notebook');
	    document.getElementById('note').innerHTML = data.nContent;
	    document.getElementById('notevis').innerHTML = data.nContent;
	    document.getElementById('nbtitle').innerHTML = data.nTitle;
	    document.getElementById('nbtitlevis').innerHTML = data.nTitle;
	    $scope.year     = data.ntYear;
	    $scope.month    = data.ntMonth;
	    $scope.day      = data.ntDay;
	    $scope.nbtitle  = data.nTitle;
	    $scope.getFirstNoteId($scope.nbook_ix);
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

    /*-------------------------------------------------------------------*
      UI Functions
      -------------------------------------------------------------------*/
    $scope.isActive = function(page) {
	if (page == $scope.current)
	    return true; 
	return false;
    };

    $scope.isFirstNote = function() {
	if ($scope.note_ix === $scope.firstNoteId)
	    return true;
	return false;
    };

    $scope.isLastNote = function ()
    {
	if ($scope.note_ix === $scope.lastNoteId)
	    return true;
	return false;
    };

    $scope.isFav = function() {
	return $scope.favorite;
    }

    
    $scope.isNotFav = function() {
	return (!$scope.favorite);
    }

    $scope.viewMode = function() {
	return (!$scope.saveMode);
    }

    $scope.editMode = function() {
	return ($scope.saveMode);
    }

    /*-------------------------------------------------------------------*
      Note Address Functions
      -------------------------------------------------------------------*/
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
	$scope.callNote(ix);
	$scope.current = curr;
    }

    // Notes menu
    $scope.noteReceived = function(data)
    {
	$scope.toggleVis('notebook');
	document.getElementById('note').innerHTML = data.nContent;
	document.getElementById('notevis').innerHTML = data.nContent;
	document.getElementById('nbtitle').innerHTML = data.nTitle;
	document.getElementById('nbtitlevis').innerHTML = data.nTitle;
	$scope.year = data.ntYear;
	$scope.month = data.ntMonth;
	$scope.day   = data.ntDay;
	$scope.nbtitle = data.nTitle;
	$scope.note_ix = data.ntId;
	$scope.current = data.parentId;
	$scope.updateFav();
    }
    
    $scope.callNote = function(ix) {
	$http.get(SERVER + "get-note/" + ix).success($scope.noteReceived);
	$scope.message ="";
    }

    $scope.initializeMenu = function(){
	
    }

    /*----------------------------------------------------------------------
      Notes Main Menu
      --------------------------------------------------------------------*/
    $scope.mnPrev = function() {
	$scope.initializeMenu();
	// Instead of hardcode 0, set a variable (filled from backend)
	if ($scope.note_ix > 0){
	    $http.get(SERVER + "get-prev/" + $scope.nbook_ix + "/" + $scope.note_ix).success($scope.noteReceived);
	}
	$scope.message ="";
    }
    
    $scope.mnNext = function(){
	$scope.initializeMenu();
	$scope.callNote($scope.note_ix + 1);
	$http.get(SERVER + "get-next/" + $scope.nbook_ix + "/" + $scope.note_ix).success($scope.noteReceived);
	$scope.message ="";
    }

    $scope.mnSaveEdit = function() {
	if($scope.saveMode) {
	    if(!$scope.validateSave())
	    {
		return;
	    }else{
		$scope.saveUpdate();
	    }
	    $scope.saveMode = false;
	    $scope.save_edit = "Edit";
	}else{
	    $scope.saveMode = true;
	    $scope.save_edit = "Save";
//	    editor.disableEditing = false;
	}
	
    }

    
    $scope.mnFav = function() {
	if ($scope.favorite){ // UnFav
	    $http.get(SERVER + "unfav-note/" + $scope.note_ix).success(function (data){
		$scope.message = data.messageR;
		$scope.favorite = false;
	    }).error(function(data){
		$scope.message = data;
	    });
	}else { // Fav note
	    $http.get(SERVER + "fav-note/" + $scope.note_ix).success(function (data){
		$scope.message = data.messageR;
		$scope.favorite = true;
	    }).error(function(data){
		$scope.message = data;
	    });
	}
    }


    $scope.mnCreate = function() {
	var curr = $scope.current;
	$scope.tmptitle    = $scope.nbtitle;
	$scope.tmpcontent  = $scope.content;
	$scope.nbtitle = "";
	document.getElementById('nbtitle').innerHTML = "";
	document.getElementById('nbtitlevis').innerHTML = "";
	document.getElementById('note').innerHTML = "";
	document.getElementById('notevis').innerHTML = "";
	$scope.action = "create_note";	

	$scope.current = curr;
	$scope.message = "";
	$scope.saveMode = true;
	$scope.save_edit = "Save";

    };

    $scope.mnDelete = function() {
	console.log("Delete note?");
	$scope.delete_note = true;
	$scope.message ="";	
    }


    /*-------------------------------------------------------------------*
      Note Menu helper functions
      -------------------------------------------------------------------*/
    $scope.updateFav = function (){
	console.log("Check if favorite...");
	$http.get(SERVER + "is-fav/" + $scope.note_ix).success(function (data){
	    $scope.favorite = data.successR;
	}).error(function(data){
	    $scope.updateFav();
	});

    }

    $scope.setNavTitle = function(title) {
	$scope.navigation = "Notes for " + title + " [" + $scope.title + "]";
    }

	$scope.validateSave = function() {
	    $scope.nbtitle = document.getElementById("nbtitle").innerHTML;
 	    $scope.content = document.getElementById("note").innerHTML;
	    console.log($scope.content);
	    if ($scope.nbtitle === "" && $scope.content === "") {
		$scope.message = "Provide a note title and content!";
		return false;
	    }
	    if ($scope.nbtitle == "") {
		$scope.message = "Provide a valid title!";
		return false;
	    }
	    if ($scope.content == "") {
		$scope.message = "Note is empty!";
		return false;
	    }

	    return true;
	}

	$scope.saveUpdate = function() {
	    if($scope.action === "create_note"){
		var req = {
		    method: 'POST',
		    url: SERVER + 'create-note',
		    headers: {
			'Content-Type' : undefined
		    },
		    data: {
			crNbId  : $scope.nbook_ix,
			crTitle : $scope.nbtitle,
			crContent : $scope.content
		    }
		}
		console.log($scope.nbtitle);
		console.log(JSON.stringify(req.data));
		$http(req).then(function(result){
		    $scope.message = result.data.messageR;
		    if(result.data.successR){
			$scope.toggleVis('notebook');
			$scope.getLastNote($scope.nbook_ix);
		    }
		});
	    }else{
		var change = false;
		if ($scope.content != $scope.lastContent || $scope.nbtitle != $scope.lastTitle) {
		    change = true;
		}
		console.log("Change...");
		if (change){
		    // $scope.current = curr;
		    var req = {
			method: 'POST',
			url: SERVER + 'update-note',
			headers: {
			    'Content-Type' : undefined
			},
			data: {
			    updId    : $scope.note_ix,
			    updTitle : $scope.nbtitle,
			    updContent : $scope.content
			}
		    };
		
		    $http(req).then(function(result){
			$scope.message = result.data.messageR;
			if(result.data.successR){
			    document.getElementById('nbtitlevis').innerHTML = $scope.nbtitle;
			    document.getElementById('notevis').innerHTML = $scope.content;
			    //			console.log("Entering...");
			    // $scope.openNote($scope.note_ix);
			}		    
		    }, function(response){
			console.log("ERROR:");
			console.log(JSON.stringify(response));
			$scope.message = response.data;
			// $scope.toggleVis('notebook');
		    });
		}else {
		    $scope.toggleVis('notebook');
		    $scope.current = curr;
		}	    
	    }	    
	}
	
    /*-----------------------------------------------------------------------
      Inferior menu functions
    ------------------------------------------------------------------------*/

    $scope.btnHeader = function() {
	var tx = document.getElementById("note").innerHTML;
	var newVal = "";

	var sel = document.getSelection();

	console.log(JSON.stringify(sel));

	// console.log("Anchor Offset: " + sel.anchorOffset);
	
	if (sel.baseOffset != 0 || sel.focusOffset != 0) {
	    var st = sel.anchorOffset;
	    var en = sel.focusOffset;

	    if (st > en ){
		st = en;
		en = sel.baseOffset;
	    }
		
	    console.log("Notes Inner HTML: " + tx);
	    console.log("ST: " + st);
	    console.log("EN: " + en);
	    console.log("Substring: " + sel.baseNode.nodeValue.substring(st, en));
	    console.log("Sel Node value: " + sel.baseNode.nodeValue);

	    
	}else{
	    $scope.message = "Please select some text";
	}
	   
    };

    $scope.btnCode = function () {
	$scope.code = true;

    }

    $scope.btnSShot = function () {
	console.log('Screenshot...');
	ipc.send('capture-screenshot', {});
    }

    $scope.delCancel = function() {
	$scope.delete_note = false;
	$scope.message ="";	
    }

    $scope.delAccept = function() {
	$scope.delete_note = false;
	$http.get(SERVER + "delete-note/" + $scope.note_ix).success(function(data) {
	    $scope.message = data.messageR;
	    $scope.mnPrev();
	    // TODO: Wee need to check what is last note and first note again
	}).error(function (data) {
	    $scope.message = data;
	});;
    }

    $scope.surround = function(surr) {
	var tx = document.getElementById("note");
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

    // This function is called by the backend
    $scope.addScreenshot = function (ssid) {
	$scope.addHtml('<img src="../bin/images/' + ssid + '.png"/>');
    }

    $scope.saveCaret = function () {
	var containerEl = document.getElementById('note');
	var range = window.getSelection().getRangeAt(0);
        var preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(containerEl);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        var start = preSelectionRange.toString().length;

        $scope.savedSelection = {
            start: start,
            end: start + range.toString().length
        };	
    }

    $scope.restoreCaret = function () {
	var containerEl = document.getElementById('note');
	var savedSel = $scope.savedSelection;
	var charIndex = 0, range = document.createRange();
        range.setStart(containerEl, 0);
        range.collapse(true);
        var nodeStack = [containerEl], node, foundStart = false, stop = false;
        
        while (!stop && (node = nodeStack.pop())) {
            if (node.nodeType == 3) {
                var nextCharIndex = charIndex + node.length;
                if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
                    range.setStart(node, savedSel.start - charIndex);
                    foundStart = true;
                }
                if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
                    range.setEnd(node, savedSel.end - charIndex);
                    stop = true;
                }
                charIndex = nextCharIndex;
            } else {
                var i = node.childNodes.length;
                while (i--) {
                    nodeStack.push(node.childNodes[i]);
                }
            }
        }

        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);	
    }

    $scope.addHtml = function(html, typ) {

	document.getElementById('note').focus();
	var range;
	var sel = window.getSelection();
	if (sel.getRangeAt && sel.rangeCount) {
	    range = sel.getRangeAt(0);
	    range.deleteContents();

	    // Range.createContextualFragment() would be useful here but is
	    // non-standard and not supported in all browsers (IE9, for one)
	    var el = document.createElement("p");
	    if(typ != undefined){
		el.innerHTML = html; //"[" + typ + "] " + html;
	    }else{
		el.innerHTML = html;
	    }
	    var frag = document.createDocumentFragment(), node, lastNode;
	    while ( (node = el.firstChild) ) {
		lastNode = frag.appendChild(node);
	    }
	    range.insertNode(frag);
            
	    // Preserve the selection
	    if (lastNode) {
		range = range.cloneRange();
		range.setStartAfter(lastNode);
		range.collapse(true);
		sel.removeAllRanges();
		sel.addRange(range);
	    }
	}
    }

    $scope.cdAccept = function() {
	var tx = document.getElementById("note");
	$scope.st = tx.selectionStart;
	$scope.en = tx.selectionEnd;
	$scope.code = false;
	var newVAL = "";
	var tx = document.getElementById("note");
	var added = 0;
	var lg = document.getElementById("lang");
	var cd = document.getElementById("code");

	var req = {
	    method: 'POST',
	    url:    SERVER + "get-html",
	    headers: {
		'Content-Type': undefined
	    },
	    data: {
		code : cd.value,
		lang : lg.value
	    }
	}
	$http(req).then(function(result){
	    console.log(JSON.stringify(result.data));
	    console.log(result.data.successR);
	    if(result.data.successR){
		$scope.addHtml(result.data.messageR, lg.value);
	    }else{
		$scope.message = result.data.messageR;
	    }
	}, function(response){
	    console.log("ERROR:");
	    console.log(JSON.stringify(response));
	    $scope.message = response.data;
	});
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
	    newVal = newVal + tx.value.substring($scope.en, tx.value.length);
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

    /*-------------------------------------------------------------------*
      MAIN
      -------------------------------------------------------------------*/
    $scope.initializeApp();

    
});



/*-------------------------------------------------------------------*
  Backend Functions
  -------------------------------------------------------------------*/
var getScope = function() {
    var main = document.getElementById("html");
    var sc = angular.element(main).scope();
    return sc;
};

// Screenshot taken
ipc.on('screenshot', function(data) {
    var sc = getScope();
    sc.$apply(function() {
	sc.addScreenshot(data.ssid);
    });
});


var editor = null;

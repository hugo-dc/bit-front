var app = require('app'); // Module to control application life
var BrowserWindow = require('browser-window'); // Module to create native browser window.

// communicates UI with backend
var ipc = require('ipc');

// Disk database
var db = require('diskdb');

// connects to the bndb directory
db.connect('bndb', ['settings']);

// find previous settings
var settings = db.settings.find();

// Initialize notepad data
var ndata = {};

// if no settings found, create a default
if (db.settings.count() == 0) {
  db.settings.save([
    {
      "main_nb" : "",
      "notebooks" : [],
      "favorites" : [],
    }
    ]);
  settings = db.settings.find();
}

var notebookExist = function(name) {
  var ix = settings.length - 1;
  var nbs = settings[ix].notebooks;

  for (i in nbs )
  {
    if (name == nbs[i].name)
      return true; 
  }
  return false;
}

var getNotebookById = function(nb_id) {
    var ix = settings.length - 1;
    var nbs = settings[ix].notebooks;
    for(i in nbs ) {
	if ( nbs[i].id == nb_id ) {
	    return nbs[i];
	}
    }
}

var getNotebookIndex = function(nb_id) {
    var nbs = settings[settings.length -1 ].notebooks;
    for ( i in nbs) {
	if (nbs[i].id == nb_id )
	    return i;
    }
}

var getNotebookByIx = function(nb_ix) {
    var ix = settings.length - 1;
    var nbs = settings[ix].notebooks;
    return nbs[nb_ix];
}

    
var getNotebooks = function() {
    var ix = settings.length - 1;
    var nbs = settings[ix].notebooks;
    return nbs;
}

var getDMY = function() {
    var today = new Date();
    var d = today.getDate();
    var m = today.getMonth() + 1;
    var y = today.getFullYear();

    if (d < 10)	d = '0' + d.toString();
    if (m < 10) m = '0' + m.toString();

    return [d,m,y];
}
var getHtml = function(key, markdown) {
    var result = null;
    var fs = require('fs');
    var child_process = require('child_process');

    d = getDay(key);
    m = getMonth(key);
    y = getYear(key);
    fname = y + '-' + m + '-' + d + '-' + key;
    
    fs.writeFileSync('./bin/posts/' + fname + '.md', markdown);
    var ch = child_process.spawnSync(process.cwd() + '\\bin\\build.bat', [], {cwd: process.cwd() + '\\bin'});
    var html = fs.readFileSync('.\\bin\\_site\\posts\\' + fname + '.html');

    return html.toString();
}

var generateKey = function() {
    var today = new Date();
    var ms    = today.getMilliseconds().toString();
    var s     = today.getSeconds().toString();
    var mn    = today.getMinutes().toString();
    var h     = today.getHours().toString();
    var d     = today.getDate().toString();
    var m     = (today.getMonth() + 1 ).toString();
    var y     = today.getFullYear().toString();

    if (m < 10) {
	m = "0" + m;
    }
    if (d < 10) {
	d = "0" + d;
    }
    
    var key = y + m + d + h + mn + s + ms;
    return key;
}

var getYear = function(key) {
    return key.substring(0,4);
}

var getMonth = function(key) {
    return key.substring(4,6);
}

var getDay = function(key) {
    return key.substring(6,8);
}

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will 
// be closed automatically when the Javascript is GCed
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q 
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when electron has finished 
// initialization and is ready to create browser windows.
app.on('ready', function() {
    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 800, height: 600});
    mainWindow.loadUrl('file://' + __dirname + '/app/index.html');

    mainWindow.maximize();

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
	// Dereference the window object, usually you would store windows 
	// in an array if your app supports multi windows, this is the time 
	// when you should delete the corresponding element.
	mainWindow = null;
    });
});

// Load specific notebook
ipc.on('open-notebook', function(event, args) {
    var ix = getNotebookIndex(args.id);
    var nbs = getNotebooks();
    var ntix = nbs[ix].notes.length - 1;

    mainWindow.webContents.send('notebook-ready',
				{
				    "nbs": nbs,
				    "nb_ix": ix,
				    "nt_ix": ntix,
				    "debug" : __dirname
				});
});

// Create note
ipc.on('create-note', function(event, args) {
    console.log("Entering `create-note` backend process");

    var nb  = getNotebookByIx(args.nbix); 
    var key = generateKey();
    var d   = getDay(key);
    var m   = getMonth(key);
    var y   = getYear(key);
    
    var html = getHtml(key, args.content);
    
    var note = {key    : key,
		year   : y,
		month  : m,
		day    : d,
		title  : args.title,
		content: args.content,
		html:    html
	       };

    nb.notes.push(note);
    var ntix = nb.notes.length - 1;
    
    var ix = settings.length - 1;
    settings = db.settings.find();
    console.log("Saving in database...");
    settings[ix]["notebooks"][args.nbix] = nb;
    db.settings.save(settings[ix]);

    mainWindow.webContents.send('notebook-ready',
				{"nbs" : settings[ix].notebooks,
				 "nb_ix" : args.nbix,
				 "nt_ix" : ntix,
				 "debug" : __dirname
				}
			       );
});

// Screenshot

ipc.on('capture-screenshot', function (event, args) {
    var child_process = require('child_process');
    var clipboard = require('clipboard');

    console.log('Minimizing...');
    mainWindow.minimize();

    var ch = child_process.spawnSync(process.cwd() + '\\bin\\bnsc.bat', [], {cwd: process.cwd() + '\\bin'});

    console.log('Maximizing...');
    mainWindow.maximize();

    var ssid = clipboard.readText();
    mainWindow.webContents.send('screenshot', {'ssid': ssid});
});


// Update note
ipc.on('update-note', function(event, args) {
    console.log("Entering `update-note` backend process");
    console.log("======================================");
    var nb = getNotebookByIx(args.nbix);
    var note = nb.notes[args.ntix];
    console.log("Received:\n\tnbix = " + args.nbix + "\n\tntix = " + args.ntix);

    var ix = settings.length - 1;

    if (args.content) {
	var html = getHtml(note.key, args.content);
	console.log("Updating note content:");
	console.log(JSON.stringify(nb.notes[args.ntix]));
	nb.notes[args.ntix].content = args.content;
	nb.notes[args.ntix].html    = html;
    }
    if (args.title) {
	console.log("Updating note title:");
	console.log("Using " + args.title);
	nb.notes[args.ntix].title   = args.title;
	console.log(JSON.stringify(nb.notes[args.ntix]));	
    }

    settings = db.settings.find();
    console.log("Saving in database...");
    settings[ix]["notebooks"][args.nbix] = nb;
    db.settings.save(settings[ix]);

    mainWindow.webContents.send('notebook-ready', {"nbs" : settings[ix].notebooks , "nb_ix" : args.nbix, "nt_ix" : args.ntix, "debug": __dirname});
});



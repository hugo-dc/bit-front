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
    
    var fname = y + '-' + m + '-' + d + '-' + key;
    
    fs.writeFileSync('./bin/posts/' + fname + '.md', markdown);
    var ch = child_process.spawnSync(__dirname + '\\bin\\build.bat', [], {cwd: __dirname + '\\bin'});
    var html = fs.readFileSync('./bin/_site/posts/' + fname + '.html');

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

// Create Notebook
ipc.on('create-notebook', function(event, args) {
    var key = generateKey();
    var d   = getDay(key);
    var m   = getMonth(key);
    var y   = getYear(key);
    var defmd = "Welcome!\n========\n\n\nHi!, Welcome to BeeLog, your personal notebook!.\n\nYou write your personal/job blog using BeeLog and Markdown Syntax!. Here is a simple explanation of the Markdown Syntax:\n\nMarkdown Syntax\n===============\n\nMarkdown Syntax is a way to write text that is readible for people but that it\ncan also be converted to HTML.\n\nLet's go through a series of examples on how to write Markdown Syntax.\n\n\nExamples:\n\n------------------\n\nThe following markdown text:\n\n```markdown\nYou can write Headers\n=====================\n```\n\n\nProduces the following HTML:\n\nYou can write Headers\n=====================\n\n\n------------------\n\nMarkdown text:\n\n```markdown\nYou can write subheaders\n------------------------\n```\n\nHTML:\n\nYou can write subheaders\n------------------------\n\n------------------\n\nMarkdown:\n\n```markdown\n**You can write bold text**\n```\n\nHTML:\n\n**You can write bold text**\n\n------------------\n\nMarkdown:\n\n```markdown\n*You can write text in italics*\n```\n\n\nHTML:\n\n*You can write text in italics*\n\n------------------\n\nMarkdown:\n\n```markdown\n1. Item 1 \n1. Item 2\n1. Item 3\n```\n\nHTML:\n\n\n1. Item 1 \n1. Item 2\n1. Item 3\n\n-------------------\n\nMarkdown:\n\n```markdown\n* Item 1\n* Item 2\n* Item 3\n```\n\nHTML: \n\n* Item 1\n* Item 2\n* Item 3\n\n--------------------\n\nMarkdown:\n\n```markdown\n[This is a link to Google](http://www.google.com/)\n```\n\nHTML:\n\n[This is a link to Google](http://www.google.com/)\n\n\n------------------\n\nMarkdown:\n\n```markdown\n![image](http://fc00.deviantart.net/fs71/f/2011/129/6/c/dptux_by_teliok-d3fyij5.png)\n```\n\nHTML:\n\n![image](http://fc00.deviantart.net/fs71/f/2011/129/6/c/dptux_by_teliok-d3fyij5.png)\n\n-----------------\n\nMarkdown:\n\n```markdown\n\n ```abap\nREPORT znumbers.\n\ndata:\nmy_int type i.\n\nparameters:\nmy_hex type x.\n\nmy_int = my_hex.\n\nwrite:/ 'HEX: ', my_hex, /'INT: ', my_int.\n ```\n\n```\n\nHTML:\n\n```abap\nREPORT znumbers.\n\ndata:\nmy_int type i.\n\nparameters:\nmy_hex type x.\n\nmy_int = my_hex.\n\nwrite:/ 'HEX: ', my_hex, /'INT: ', my_int.\n```\n\n-----------------\n\nMarkdown\n\n```markdown\n ```javascript\n var a = 0;\n var b = 1;\n\n var c = a + b;\n\n alert(c);\n\n\n ```\n```\n\n\n```javascript\nvar a = 0;\nvar b = 1;\n\nvar c = a + b;\n\nalert(c);\n```\n";
    var defhtml = getHtml(key, defmd);

    ndata.id    = args.name.replace(/\s+/g, '').toLowerCase(); 
    ndata.icon  = 'fa-edit';
    ndata.name  = args.name;
    ndata.desc  = args.desc;
    ndata.notes = [
	{key    : key,
	 year   : y,
	 month  : m,
	 day    : d,
         title  : "Your First Post",
         content: defmd, 
         html:    defhtml, 
        }
    ];
  //ndata.link  = "#";
  ndata.click = 'openNotebook(' + args.name + ')';

  if (notebookExist(args.name)) {
      mainWindow.webContents.send('notebook-exists');
  } else {
      var ix = settings.length - 1;
      settings = db.settings.find();

      settings[ix]["notebooks"].push(ndata);
      db.settings.save(settings[ix]);

      var nbs = settings[ix]["notebooks"];
      var ix  = nbs.length - 1;
      var ntix = nbs[ix].notes.length - 1;

      mainWindow.webContents.send('notebook-ready', { "nbs" : nbs , "nb_ix" : ix, "nt_ix" : ntix } );
  } 

});

// Load existing notebooks
ipc.on('load-notebooks', function() {
  var nbs = getNotebooks();  
  mainWindow.webContents.send('loaded-notebooks', nbs);
});

// Load specific notebook
ipc.on('open-notebook', function(event, args) {
    var ix = getNotebookIndex(args.id);
    var nbs = getNotebooks();
    var ntix = nbs[ix].notes.length - 1;
    console.log(ntix);

    mainWindow.webContents.send('notebook-ready',
				{
				    "nbs": nbs,
				    "nb_ix": ix,
				    "nt_ix": ntix
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
				 "nt_ix" : ntix
				}
			       );
});

// Screenshot

ipc.on('capture-screenshot', function (event, args) {
    var child_process = require('child_process');
    var clipboard = require('clipboard');

    console.log('Minimizing...');
    mainWindow.minimize();

    var ch = child_process.spawnSync(__dirname + '\\bin\\bnsc.bat', [], {cwd: __dirname + '\\bin'});

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

    mainWindow.webContents.send('notebook-ready', {"nbs" : settings[ix].notebooks , "nb_ix" : args.nbix, "nt_ix" : args.ntix });
});



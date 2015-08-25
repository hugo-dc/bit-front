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
    console.log(d);
    if (d < 10)	d = '0' + d.toString();
    if (m < 10) m = '0' + m.toString();

    return [d,m,y];
}
var getHtml = function(markdown) {
    var result = null;
    var fs = require('fs');
    var dmy = getDMY();
    var child_process = require('child_process');

    d = dmy[0];
    m = dmy[1];
    y = dmy[2];
    var fname = y + '-' + m + '-' + d + '-convert';
    
    fs.writeFileSync('./bin/posts/' + fname + '.md', markdown);
    var ch = child_process.spawnSync(__dirname + '\\bin\\site', ['build'], {cwd: __dirname + '\\bin'});
    var html = fs.readFileSync('./bin/_site/posts/' + fname + '.html');
    console.log(html.toString());
    return html.toString();
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
  mainWindow = new BrowserWindow({ width: 800, height: 600 });
  mainWindow.loadUrl('file://' + __dirname + '/app/index.html');

  // and load the index.html of the app.

  // Open the devtools.
  // mainWindow.openDevTools();

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
    var dmy = getDMY();
    var d = dmy[0];
    var m = dmy[1];
    var y = dmy[2];
    var defmd = '# Welcome\n\nThis is a default note, you can edit, delete, or create more notes!\n\nBeenotes uses Markdown to edit each note\n\nUsing Markdown you can:\n\n* Create bullets\n\n```abap\nREPORT zhello_world.\n\nWRITE: \'Hello World\'. " This is a halfline comment\n```';
    var defhtml = getHtml(defmd);

    var key = y + '-' + m + '-' + d + '-default';
  
  ndata.id    = args.name.replace(/\s+/g, '').toLowerCase(); 
  ndata.icon  = 'fa-edit';
  ndata.name  = args.name;
  ndata.desc  = args.desc;
  ndata.notes = [{key: key, 
                  title: "Welcome note",
                  content: defmd, 
                  html:    defhtml, 
                  prev: null,
                  next: null
                 }];
  //ndata.link  = "#";
  ndata.click = 'openNotebook(' + args.name + ')';

  if (notebookExist(args.name)) {
    console.log('Notebook exists');
    mainWindow.webContents.send('notebook-exists');
  } else {
    var ix = settings.length - 1;
    settings = db.settings.find();
    settings[ix]["notebooks"].push(ndata);
    db.settings.save(settings[ix]);

      var nbs = getNotebooks();
      var ix  = nbs.length - 1;

      mainWindow.webContents.send('notebook-ready', { "nbs" : nbs , "index" : ix } );
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
    console.log(ix);
    var nbs = getNotebooks();

    mainWindow.webContents.send('notebook-ready', {"nbs": nbs, "index": ix });
});



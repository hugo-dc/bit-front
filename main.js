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

var getNotebooks = function() {
  var ix = settings.length - 1;
  var nbs = settings[ix].notebooks;
  return nbs;
}

var getHtml = function(markdown) {
    var md = require('github-markdown-preview');
    var result = null;
    md(markdown, function(err, html) {
	result = html;
	console.log(err);
    });
    console.log(result);
    console.log("Hello?");
  return result;
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

ipc.on('create-notebook', function(event, args) {
  var today = new Date();
  var d = today.getDay();
  var m = today.getMonth() + 1;
  var y = today.getFullYear();
  var defmd = '# Welcome\nThis is a default note, you can edit, delete, or create more notes!\nBeenotes uses Markdown to edit each note\n Using Markdown you can:\n* Create bullets\n```python\nx = 10\nprint "Hello world!"o```';
  var defhtml = getHtml(defmd);

  if (m < 10) m = '0' + m;
  if (d < 10) d = '0' + d;

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

    mainWindow.webContents.send('notebook-ready', nbs);
  } 

});

ipc.on('load-notebooks', function() {
  var nbs = getNotebooks();  
  mainWindow.webContents.send('loaded-notebooks', nbs);
});



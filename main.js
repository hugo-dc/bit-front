var app = require('app'); // Module to control application life
var BrowserWindow = require('browser-window'); // Module to create native browser window.

// communicates UI with backend
var ipc = require('ipc');

var startBackend = function()
{
    var fs = require('fs');
    var child_process = require('child_process');
    console.log("Starting backend process...");
    var ch = child_process.spawn(process.cwd() + "\\bndb.exe", [], {cwd: process.cwd() });
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

// Start Haskell/Scotty Backend!
startBackend();

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


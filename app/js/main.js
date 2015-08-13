
var app = angular.module('Beenotes', []);

app.controller('MainController', function($scope) {
  $scope.title = "Personal Notes";
  $scope.welcome_vis = true;
  $scope.createn_vis = false;
  $scope.pgCreateNotebook = function() {
  };

  $scope.toggleVis = function(name) {
    if ( name == "main"  )
    {
      $scope.createn_vis = false;
    }else {
      $scope.welcome_vis = false;
      $scope.createn_vis = true;
    }
  };
});


/*--------------------------------------------------------------------
 * create_notebook - create new notebook
 * -----------------------------------------------------------------*/
var createNotebook = function() 
{
  // Check if both fields are filled:
  var name = document.getElementById('nb_name');
  var desc = document.getElementById('nb_desc');
  if ( name.value == "" || desc.value == ""  )
  {
     showMessage('Provide both fields');
     return;
  }

  // TODO: Implement here, logic to call backend and create the
  // required DB or files
}

/*--------------------------------------------------------------------
 * showMessage - Show a message in the page
 * -----------------------------------------------------------------*/
var showMessage = function(message) 
{
  var mess = document.getElementById('message');

  // remove previous message if any
  while(mess.firstChild) {
    mess.removeChild(mess.firstChild);
  }
  var p    = document.createElement('P');
  p.appendChild(document.createTextNode(message));
  mess.appendChild(p)
}

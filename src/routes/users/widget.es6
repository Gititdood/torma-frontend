import angular from 'angular';
var app = angular.module('app', []);
app.controller('app', $scope => {

  $scope.username = '';
  $scope.password = '';
  $scope.userPassword = [];

  // Create new user
  $scope.createUser = () => {

    // Validation
    if($scope.username && $scope.password) {

      // POST to API
      $.post('/users',
        {
          username: $scope.username,
          password: $scope.password
        }
      ).done(function(data) {
        $scope.username = '';
        $scope.password = '';
        // Add created user to list
        $scope.data.unshift(data);
        $scope.$apply();
      }).fail(function(e) {
        console.log(e);
      });
    }
  };

  // Change password
  $scope.changePassword = (user) => {

    // Get index of user in user list
    let i = $scope.data.indexOf(user);

    if($scope.userPassword[i]) {
      // POST to API
      // TODO: I suggest we introduce a different way to make AJAX request
      //       jQuery is bloated and barely supports PUT and DELETE
      $.post('/users/changepassword',
        {
          username: user.username,
          password: $scope.userPassword[i]
        }
      ).done(function(data) {
        $scope.userPassword[i] = '';
        $scope.$apply();
        alert("Password was changed successfully.");
      }).fail(function(e) {
        console.log(e);
      });
    }
  };

  // Delete User
  $scope.deleteUser = (user) => {

    // Get index of user in user list
    let i = $scope.data.indexOf(user);

    // POST to API
    $.post('/users/delete',
      {
        username: user.username,
        password: $scope.userPassword
      }
    ).done(function(data) {

      // Remove user from list
      $scope.data.splice(i, 1);
      $scope.$apply();
      alert("User deleted.");

    }).fail(function(e) {
      console.log(e);
    });
  };

  // Retrieve user list
  $.get('/users/all')
  .done(function(data) {
    // Add users to UI
    $scope.data = data;
    $scope.$apply();

  }).fail(function(e) {
    console.log(e);
  });
});
angular.bootstrap(document, ['app']);

import { app } from 'server';
import { post, get } from 'koa-route';
import template from './template.marko';
import User from 'db/user';

// User Management UI
app.use(get('/users', async(ctx, next) => {
  ctx.body = template.stream({ /*data*/ });
  ctx.type = 'text/html';
}));

// Return all users
app.use(get('/users/all', async(ctx, next) => {
  const users = await User.all();
  ctx.body = JSON.stringify(users);
  ctx.type ="application/json";
}));

// Create user
app.use(post('/users', async(ctx, next) => {
  const fields = ctx.request.body.fields;

  // Validation
  // TODO: I suggest we introduce proper dynamic input validation,
  //       through an extern library, since we will probably to that a lot
  if(fields.username && fields.password) {
    // Create new user
    let user = new User({
      username: fields.username
    });
    // Save user with defineid password
    user.savePassword(fields.password);
    ctx.body = JSON.stringify(user);
  } else {
    // Return error message if input is not valid
    ctx.body = JSON.stringify({error: "Input not valid."});
  }

  ctx.type ="application/json";
}));

// Change password
app.use(post('/users/changepassword', async(ctx, next) => {
  const fields = ctx.request.body.fields;

  // Validation
  if(fields.password) {

    // Find user by username
    let userResults = await User.find(fields.username);

    // If there is a user with the previously definied hash
    if(userResults) {
      let user = new User(userResults);
      // Change password and save user
      let passwordChangeResult = await user.savePassword(fields.password);
      ctx.body = JSON.stringify(passwordChangeResult);
    } else {
      ctx.body = JSON.stringify({error: "User not found."});
    }

  } else {
    // Return error message if input is not valid
    ctx.body = JSON.stringify({error: "Input not valid."});
  }

  ctx.type ="application/json";
}));

// Delete user
app.use(post('/users/delete', async(ctx, next) => {
  const fields = ctx.request.body.fields;

  // Find user by username
  let userResults = await User.find(fields.username);

  if(userResults) {
    let user = new User(userResults);
    // Delete user from database
    let deleteResult = await user.delete();
    ctx.body = JSON.stringify(deleteResult);
  } else {
    ctx.body = JSON.stringify({error: "User not found."});
  }

  ctx.type ="application/json";
}));

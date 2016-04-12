import { app } from 'server';
import { post, get } from 'koa-route';
import template from './template.marko';
import User from 'db/user';

app.use(get('/login', async(ctx, next) => {
  ctx.body = template.stream({ /*data*/ });
  ctx.type = 'text/html';
}));

app.use(post('/login', async(ctx, next) => {

  var fields = ctx.request.body.fields;
  var userResults = await User.find(fields.username);

  if(userResults) {
    let user = new User(userResults);

    /* Checks if password is correct */
    if(await user.verifyPassword(fields.password)) {
      await ctx.login(user);
      /* Log initial request for currenct session */
      user.lastRequest = Math.floor(Date.now() / 1000);
      await user.save();
      ctx.body = JSON.stringify(user);
    } else {
      ctx.status = 401;
      ctx.body = "Incorrect password.";
    }
  } else {
    ctx.status = 401;
    ctx.body = "User not found.";
  }

}));

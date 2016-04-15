/* Koa App */
import koa from 'koa';
export const app = new koa();

import isDev from 'isdev';
import convert from 'koa-convert';

/* Static Files */
import serve from 'koa-static';
app.use(convert(serve(__dirname + '/public', {
  maxage: isDev ? 0 : Infinity,
  gzip: isDev ? false : true,
  // defer: true,
  hidden: isDev,
})));

/* Body Parser (form submission/file updloads) */
import bodyParser from 'koa-better-body';
app.use(convert(bodyParser({
  multipart: true,
})));

/* Session storage */
import session from 'koa-generic-session';
app.keys = ['i like turtles', 'and secret keys'];
import store from 'koa-redis';
app.store = store({ /*options*/ });
app.use(convert(session({ store: app.store })));


/* Socket.IO */
import IO from 'koa-socket';
export const io = new IO();
io.attach(app);


/* Passport (user management) */
import passport from 'koa-passport';
import User from './db/user';
passport.serializeUser((user, done) => done(null, user.username));
passport.deserializeUser(async(username, done) => {
  try {
    const userResults = await User.find(username);
    const user = new User(userResults);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
app.use(passport.initialize());
app.use(passport.session());


/* Socket.IO <--> Passport */
import { authorize } from 'koa-socket-passport';
io.use(authorize({
  key: 'koa.sid',
  secret: app.keys,
  store: app.store,
}));


/* Marko (Templating Language) */
import markoNodeReq from 'marko/node-require';
markoNodeReq.install();


/* Lasso (Bundler) */
import lasso from 'lasso';
import lassoReqNoop from 'lasso/node-require-no-op';
lasso.configure({
  plugins: ['lasso-marko', 'lasso-stylus', 'lasso-less'],
  outputDir: __dirname + '/public/lasso',
  urlPrefix: '/lasso',
  resolveCssUrls: true,
  fingerprintsEnabled: !isDev,
  minify: !isDev,
  bundlingEnabled: !isDev,
});
lassoReqNoop.enable('.css', '.styl', '.less');



/* Error handler */
app.use(async(ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = 500;
    ctx.body = err.stack;
  }
});

/* Checks if user did made a post request within X minutes */
app.use(async(ctx, next) => {
  // Check if user is logged in
  if(ctx.req.user) {
    // Minimum timespan in seconds between each POST request
    const limit = 300;
    // Timestamp
    const currentRequest = Math.floor(Date.now() / 1000);

    let user = ctx.req.user;

    // If time between requests is bigger than limit => log user out
    if(user.lastRequest && (currentRequest - user.lastRequest) > limit) {
      ctx.logout();
    } else if(ctx.req.method == "POST") {
      // Log request if user makes POST request
      user.lastRequest = currentRequest;
      await user.save();
    }
  }
  await next();
});

/* Routes */
require('./routes/home');
require('./routes/login');
require('./routes/users');

/* Socket routes */
require('./routes/socket');


/* Start Listening */
app.listen(3000, () => console.log('Server listening on 3000'));

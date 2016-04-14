import bcrypt from 'bcrypt-as-promised';
import { extend } from 'lodash';

import { db } from './';

export default class User {
  constructor(data) {
    extend(this, data);
    if (this.password)
      throw new Error('Please remove the `.password` property and use `.savePassword(password)` (to save the hash) instead');
  }
  async save() {
    console.log('Saving user');
    try {
      // Creates an hash from the username (removes white space etc.) to create a queryable key
      const userhash = new Buffer(this.username).toString('base64');
      await db.hmset('user:' + userhash, this);
    } catch (err) {
      console.error('User not saved. Error:', err.message);
      throw err;
    }
    console.log('User saved');
    return this;
  }
  async savePassword(password) {
    var hash = await bcrypt.hash(password, 8);
    this.hash = hash;
    await this.save();
    return this;
  }
  async verifyPassword(password) {
    try {
        // password: A string, usually user definied through input, which will be converted to a bcrypt hash
        // this.hash: the hashed password of the already fetched user object (for example: routes/login/index.es6:17)
        // compare password and this.hash
        // bcrypt.compare will throw an error (by default) if the two hashes do not match
        await bcrypt.compare(password, this.hash);
        // return true if they match and no error was thrown
        return true;
    } catch (err) {
		// if bcrypt.compare throws an error, return false since the passwords did not match
        return false;
    }
  }
  /* Find user by username */
  static async find(username) {
      const userhash = new Buffer(username).toString('base64');
      return db.hgetall('user:' + userhash);
  }
}

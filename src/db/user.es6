import bcrypt from 'bcrypt-as-promised';
import { extend } from 'lodash';

import { db } from './';
/* This whole section is problematic to me

I'd like this module to work directly from the /login directory
I doubt we need an extra db file. The connection to the redis DB should be opened and closed after querying.
I'd like the redis data to be in the format

user:_username_ --> hash
{
  password:_bcrypt password_
  enabled:T\F
  ...
  other customization settings per user
}



*/
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
        await bcrypt.compare(password, this.hash);
        return true;
    } catch (err) {
        return false;
    }
  }
  /* Find user by username */
  static async find(username) {
      const userhash = new Buffer(username).toString('base64');
      return db.hgetall('user:' + userhash);
  }
}

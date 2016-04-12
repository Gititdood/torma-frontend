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
        await bcrypt.compare(password, this.hash);
		// so this is what I don't understand. Where is that function returning? Does it just try to get a true and err out if not?
		// How do I just get one element of the hash, (e.g ) why do we need to duplicate the entire hash? In the grand scheme of things why not just pull the part we need, 
		// or write to the section of the redis hash or part we need? Isn't it duplicating memory usage? Obviously it would not be a huge deal since we are talking bytes, but what is the advantage to doing that really?
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

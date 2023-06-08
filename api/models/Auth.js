/**
 * Auth.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const bcrypt = require("bcrypt");

function generatePasswordHash(password) {
  return bcrypt
    .genSalt(10) // 10 is default
    .then((salt) => {
      return bcrypt.hash(password, salt);
    })
    .then((hash) => {
      return Promise.resolve(hash);
    });
}

module.exports = {
  attributes: {
    email: {
      type: "string",
      required: true,
      unique: true,
    },
    organization: {
      type: "string",
      required: true,
    },
    encryptedPassword: {
      type: "string",
    },
    role: {
      type: "string",
      defaultsTo: "user",
    },

    locked: {
      type: "boolean",
      defaultsTo: false,
    },

    passwordFailures: {
      type: "number",
      defaultsTo: 0,
    },

    lastPasswordFailure: {
      type: "string",
      columnType: "datetime",
    },
  },
  /**
   * Validates user password with stored password hash
   * @param password
   * @returns {Promise}
   */
  validatePassword: function (password, encryptedPassword) {
    const resp = bcrypt.compare(password, encryptedPassword);
    return resp;
  },

  /**
   * Set user password
   * @param password
   * @returns {Promise}
   */
  setPassword: function (password) {
    return generatePasswordHash(password).then((hash) => {
      // this.encryptedPassword = hash;
      return hash;
    });
  },
  customToJSON: function () {
    return _.omit(this, ["password", "encryptedPassword"]);
  },

  beforeCreate: function (values, next) {
    generatePasswordHash(values.password)
      .then((hash) => {
        // console.log(values, hash, "values and hash before create");
        delete values.password;
        values.encryptedPassword = hash;
        next();
      })
      .catch((err) => {
        /* istanbul ignore next */
        next(err);
      });
  },
};

/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const API_ERRORS = require("../constants/APIErrors");
const validator = require("validator");
const passValidator = require("password-validator");
const UserManager = require("../services/UserManager");

const passSchema = new passValidator();
const passMinLen = 6;
const passMaxLen = 24;

// Scheme for password validation
// See ref https://github.com/tarunbatra/password-validator
passSchema
  .is()
  .min(passMinLen)
  .is()
  .max(passMaxLen)
  .has()
  .letters()
  .has()
  .digits();

module.exports = {
  /**
   * Action for /signup
   * @param req
   * @param res
   * @returns {*}
   */
  signup: function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const email = req.body.email;
    const password = req.body.password;
    const passwordConfirm = req.body.password_confirm;
    const organization = req.body.organization;

    if (!email || !validator.isEmail(email)) {
      return res.badRequest(Utils.jsonErr("Invalid email"));
    }

    if (password !== passwordConfirm) {
      return res.badRequest(Utils.jsonErr("Password does not match"));
    }

    if (!passSchema.validate(password)) {
      return res.badRequest(
        Utils.jsonErr(
          "Password must be 6-24 characters, including letters and digits"
        )
      );
    }

    UserManager.createUser({
      email,
      password,
      organization,
    })
      .then((jwToken) => {
        res.ok({
          token: jwToken,
        });
      })
      .catch((err) => {
        if (err === API_ERRORS.EMAIL_IN_USE) {
          return res.badRequest(Utils.jsonErr("This email is already in use"));
        }
        /* istanbul ignore next */
        return res.serverError(Utils.jsonErr(err));
      });
  },
  /**
   * Action for /user/login
   * @param req
   * @param res
   * @returns {*}
   */
  login: function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const email = req.body.email;
    const password = req.body.password;

    if (!email || !validator.isEmail(email)) {
      return res.badRequest(Utils.jsonErr("Invalid email"));
    }

    if (!password) {
      return res.badRequest(Utils.jsonErr("Invalid email or password"));
    }

    UserManager.authenticateUserByPassword(email, password)
      .then((token) => {
        res.ok({ token });
      })
      .catch((err) => {
        switch (err) {
          case API_ERRORS.INVALID_EMAIL_PASSWORD:
          case API_ERRORS.USER_NOT_FOUND:
            return res.badRequest(Utils.jsonErr("Invalid email or password"));
          case API_ERRORS.USER_LOCKED:
            return res.forbidden(Utils.jsonErr("Account locked"));
          default:
            /* istanbul ignore next */
            return res.serverError(Utils.jsonErr(err));
        }
      });
  },
};

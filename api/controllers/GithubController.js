const axios = require("axios");
const { authenticateUserByToken } = require("../services/UserManager");
const GithubManager = require("../services/GithubManager");

module.exports = {
  async fetchToken(req, res) {
    if (!req.headers.authorization) {
      return res.badRequest(Utils.jsonErr("Invalid Session!"));
    }
    const token = req.headers.authorization.split(" ")[1];
    const userData = await authenticateUserByToken(token);

    Github.findOne({ user_id: userData.id }).exec((err, user) => {
      console.log(err, user, "git hub find one");
      if (err) return res.badRequest(Utils.jsonErr(err));
      return res.json({ ...user });
    });
  },
  async token(req, res) {
    const { code } = req.body;
    const clientId = "8e52c2375fd454b8c496";
    const clientSecret = "e0116832c77de2e63afd78dcd40afd4173c83c18";

    if (!req.headers.authorization) {
      return res.badRequest(Utils.jsonErr("Invalid Session!"));
    }

    const token = req.headers.authorization.split(" ")[1];

    const userData = await authenticateUserByToken(token);

    // console.log(userData, "user by token xxx");

    try {
      const response = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
        }
      );

      const access_token = response.data.split("&")[0].split("=")[1];
      // console.log(access_token, "Acc token");
      const resp = await GithubManager.createGithubToken({
        access_token: access_token,
        user_id: userData.id,
      });
      console.log(resp, "xxyyxx");
      return res.json({ ...resp });
    } catch (error) {
      console.log("Error obtaining access token:", error);
      return res.badRequest(Utils.jsonErr(error));
    }
  },
};
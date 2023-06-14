const axios = require("axios");
const { authenticateUserByToken } = require("../services/UserManager");
const GithubManager = require("../services/GithubManager");

module.exports = {
  async fetchToken(req, res) {
    const headerAuthorization = req.headers.authorization.split(" ");
    if (!headerAuthorization[1]) {
      return res.badRequest(Utils.jsonErr("Invalid Session!"));
    }
    const token = headerAuthorization[1];
    const userData = await authenticateUserByToken(token);

    try {
      const payload = { user_id: userData.id };
      const resp = await GithubManager.fetchGithubToken(payload);
      delete resp.access_token;
      res.json({ ...resp });
    } catch (error) {
      console.log(error, "err");
      return res.badRequest(Utils.jsonErr("Unable to fetch access token"));
    }
  },
  async deleteToken(req, res) {
    try {
      const userId = req.body.user_id;
      let payload = { user_id: userId };
      const resp = await GithubManager.deleteGithubToken(payload);
      res.ok(resp);
    } catch (error) {
      console.log(error, "err");
      return res.badRequest(Utils.jsonErr("Unable to delete the access token"));
    }
  },
  async getGithubUser(req, res) {
    if (!req.headers.authorization) {
      return res.badRequest(Utils.jsonErr("Invalid Session!"));
    }
    const token = req.headers.authorization.split(" ")[1];

    const userData = await authenticateUserByToken(token);

    if (userData) {
      console.log(userData, "userData");
      const resp = await GithubManager.getAccessToken(userData.id);

      if (resp && resp.length > 0) {
        const accessToken = resp[0].access_token;

        try {
          const response = await axios.get("https://api.github.com/user", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          // console.log(response.data, "Github User Details");
          return res.json({ ...response.data });
        } catch (error) {
          // console.log("Error fetching user details:", error);
        }
      }
    } else {
      return res.badRequest(
        "Access Token Doesnot exist. Please connect your repo!"
      );
    }
  },
  async getGithubRepos(req, res) {
    if (!req.headers.authorization) {
      return res.badRequest(Utils.jsonErr("Invalid Session!"));
    }
    const token = req.headers.authorization.split(" ")[1];

    const userData = await authenticateUserByToken(token);

    if (userData) {
      const resp = await GithubManager.getAccessToken(userData.id);

      if (resp && resp.length > 0) {
        const accessToken = resp[0].access_token;

        try {
          const response = await axios.get(
            "https://api.github.com/user/repos",
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          // console.log(response.data, "Github User Details");
          return res.json(response.data);
        } catch (error) {
          // console.log("Error fetching user details:", error);
        }
      }
    } else {
      return res.badRequest(
        "Access Token Doesnot exist. Please connect your repo!"
      );
    }
  },
  async getGithubRepoCommitDetails(req, res) {
    const { name, projectName } = req.body;
    if (!name) {
      return res.badRequest(Utils.jsonErr("Name missing"));
    }
    if (!projectName)
      return res.badRequest(Utils.jsonErr("Project Name missing"));
    if (!req.headers.authorization) {
      return res.badRequest(Utils.jsonErr("Invalid Session!"));
    }
    const token = req.headers.authorization.split(" ")[1];

    const userData = await authenticateUserByToken(token);

    if (userData) {
      const resp = await GithubManager.getAccessToken(userData.id);

      if (resp && resp.length > 0) {
        const accessToken = resp[0].access_token;

        try {
          const response = await axios.get(
            `https://api.github.com/repos/${name}/${projectName}/commits`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          // console.log(response.data, "Github User Details");
          return res.json(response.data);
        } catch (error) {
          // console.log("Error fetching user details:", error);
        }
      }
    } else {
      return res.badRequest(
        "Access Token Doesnot exist. Please connect your repo!"
      );
    }
  },
  async postContributorData(req, res) {
    const { url } = req.body;
    console.log(url, "url here xxxxx");
    if (!url) {
      return res.badRequest(Utils.jsonErr("URL missing"));
    }

    if (!req.headers.authorization) {
      return res.badRequest(Utils.jsonErr("Invalid Session!"));
    }
    const token = req.headers.authorization.split(" ")[1];

    const userData = await authenticateUserByToken(token);

    if (userData) {
      const resp = await GithubManager.getAccessToken(userData.id);

      if (resp && resp.length > 0) {
        const accessToken = resp[0].access_token;

        console.log(url, "url here xxxxx");

        try {
          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          // console.log(response.data, "Github User Details");
          return res.json(response.data);
        } catch (error) {
          // console.log("Error fetching user details:", error);
        }
      }
    } else {
      return res.badRequest(
        "Access Token Doesnot exist. Please connect your repo!"
      );
    }
  },
  async token(req, res) {
    const { code } = req.body;
    const clientId = sails.config.custom.clientId;
    const clientSecret = sails.config.custom.clientSecret;

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

      delete resp.access_token;

      return res.json({ ...resp });
    } catch (error) {
      console.log("Error obtaining access token:", error);
      return res.badRequest(Utils.jsonErr(error));
    }
  },
};

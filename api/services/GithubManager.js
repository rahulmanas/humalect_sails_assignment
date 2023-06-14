function doesAccessTokenExist(userId) {
  return new Promise((resolve, reject) => {
    Github.find({ user_id: userId }).exec((err, user) => {
      // console.log(err, user, "git hub find one");
      if (err) return reject(err);
      return resolve(user);
    });
  });
}

function getAccessTokenDetails(value) {
  //   console.log(value, "xcv");
  return new Promise((resolve, reject) => {
    Github.findOne({ access_token: value }).exec((err, user) => {
      if (err) return reject(err);
      return resolve(user);
    });
  });
}

module.exports = {
  createGithubToken: (values) => {
    return new Promise((resolve, reject) => {
      doesAccessTokenExist(values.user_id)
        .then((exists) => {
          // console.log(exists, "exists xxx");
          if (exists && exists.length > 0) {
            return reject("Access Token Exist");
          }

          // console.log(values, "value");

          Github.create(values).exec(async (createErr, user) => {
            // console.log(createErr, "create err");
            if (createErr) return reject(createErr);
            // console.log(user, "does exist");
            const resp = await getAccessTokenDetails(values.access_token);
            resolve(resp);
          });
        })
        .catch(reject);
    });
  },
  getAccessToken: function (values) {
    return new Promise((resolve, reject) => {
      Github.find({ user_id: values }).exec((err, user) => {
        // console.log(err, user, "git hub find one");
        if (err) return reject(err);
        return resolve(user);
      });
    });
  },
  deleteGithubToken: function (values) {
    return new Promise((resolve, reject) => {
      Github.findOne(values).exec(async (err, user) => {
        // console.log(err, user, "git hub find one");
        if (err) return reject(Utils.jsonErr(err));
        await Github.destroy(user);
        return resolve("Access Token deleted successfully");
      });
    });
  },
  fetchGithubToken: function (values) {
    return new Promise((resolve, reject) => {
      Github.findOne(values).exec((err, user) => {
        console.log(err, user, "git hub find one");
        if (err) return reject(Utils.jsonErr("Couldn't find token"));
        return resolve(user);
      });
    });
  },
};

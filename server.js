let express = require("express");
let request = require("request");
let querystring = require("querystring");

let app = express();

let redirect_uri = process.env.REDIRECT_URI || "http://localhost:8888/callback";

// route for when login button is clicked
app.get("/login", function(req, res) {
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      // adds property: value pairs to url (prop1=value1&prop2=value2...)
      querystring.stringify({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: "user-read-private user-read-email",
        redirect_uri
      })
  );
});

// callback route to authorize account using Oauth
app.get("/callback", function(req, res) {
  let code = req.query.code || null;
  let authOptions = {
    url: "https://accounts.spotify.com/api/token",
    // adds property: value pairs to url
    form: {
      code: code,
      redirect_uri,
      grant_type: "authorization_code"
    },
    headers: {
      Authorization:
        "Basic " +
        new Buffer(
          process.env.SPOTIFY_CLIENT_ID +
            ":" +
            process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64")
    },
    json: true
  };
  request.post(authOptions, function(error, response, body) {
    // stores access token 
    var access_token = body.access_token;
    let uri = process.env.FRONTEND_URI || "http://localhost:3000";
    // redirects to front end with access code as url param
    res.redirect(uri + "?access_token=" + access_token);
  });
});

let port = process.env.PORT || 8888;
console.log(
  `Listening on port ${port}. Go /login to initiate authentication flow.`
);
app.listen(port);

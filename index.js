const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const path = require("path");

const PORT = 3000;
const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

const users = [];

const sessions = [];

app.get("/", (_, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "public") });
});

app.get("/login", (_, res) => {
  res.sendFile("login.html", { root: path.join(__dirname, "public") });
});

app.get("/signup", (req, res) => {
  res.sendFile("signup.html", { root: path.join(__dirname, "public") });
});

app.get("/users", (_, res) => {
  res.send(users);
});

app.get("/sessions", (_, res) => {
  res.send(sessions);
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  for (const user of users) {
    if (user.username == username && user.password == password) {
      const sessionId = crypto
        .createHash("sha512")
        .update(crypto.randomUUID())
        .digest("base64");
      sessions.push({
        user: user.id,
        sessionId: sessionId,
      });
      res.cookie("sessionId", sessionId);
      res.redirect("/panel");
      return;
    }
  }
  res.sendFile("wrong-password.html", {
    root: path.join(__dirname, "public"),
  });
});

app.post("/signup", (req, res) => {
  const { username, password } = req.body;
  if (password.trim() == "") {
    res.sendFile("invalid-password.html", {
      root: path.join(__dirname, "public"),
    });
    return;
  }
  if (users.find((user) => user.username == username)) {
    res.sendFile("existing-user.html", {
      root: path.join(__dirname, "public"),
    });
    return;
  }
  users.push({
    id: crypto.randomUUID(),
    username: username,
    password: password,
  });
  res.redirect("/login");
});

app.get("/panel", (req, res) => {
  const sessionId = req.cookies.sessionId;
  for (const session of sessions) {
    if (session.sessionId == sessionId) {
      res.sendFile("painel.html", { root: path.join(__dirname, "public") });
      return;
    }
  }
  res.sendFile("unauthorized.html", {
    root: path.join(__dirname, "public"),
  });
});

app.get("/logout", (_, res) => {
  res.cookie("sessionId", "");
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

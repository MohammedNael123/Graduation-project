const express = require("express");
const session = require("express-session");
const router = express.Router();

router.use(session({
  secret:"my secret",
  saveUninitialized:true,
  cookie:{secure:false}
}));

router.post("/logout", (req, res) => {
    // Clear the token cookie
    req.session.destroy(err => {
      if (err) {
          return res.status(500).json({ message: "Error logging out" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
  });
});

module.exports = router ;
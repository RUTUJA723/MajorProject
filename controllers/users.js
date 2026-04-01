const User = require("../models/user.js");

module.exports.renderSingupForm =   (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signUp = async(req, res) => {
    try{
    let {username, email, password, mobile} = req.body;
    const newUser = new User({email, username, mobile});
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
        if(err){
            return next(err);
        }
        req.flash("success", "Welcome to MajesticRestVillas!");
    res.redirect("/listings");
    });
}catch(e){
    req.flash("error", e.message);
    res.redirect("/signup");
}
};

module.exports.renderloginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.renderBecomeHostForm = (req, res) => {
  res.render("users/becomeHost");
};

module.exports.sendHostRequest = async (req, res) => {
    const user = await User.findById(req.user._id);

    user.hostRequest = true;
    user.hostStatus = "pending";

    if (req.file) {
        user.hostDocument = req.file.path;
    }

    await user.save();

    req.flash("success", "Host request sent successfully!");
    res.redirect("/listings");
};

module.exports.login =  async(req, res) => {
        req.flash("success", "Welcome back to MajesticRestVillas!");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err){
            return next(err);
        }
        req.flash("success", "you are logged out now!");
        res.redirect("/listings");
    })
}


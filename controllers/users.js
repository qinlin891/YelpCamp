//Require necessary modules
const User = require('../models/user');

//render register page
module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

//register user and establish a login session
module.exports.register = async(req, res, next) => {
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registerUser = await User.register(user, password);
        req.login(registerUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp');
            res.redirect('/campgrounds');
        });
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('register');
    } 
};

//render login page
module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

//establish a login session
module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(`${redirectUrl}`);
};


//logout user and clear the login session if any
module.exports.logout = async (req, res, next) => {
    req.logout(function(err) {
        if(err) {
            return next(err);
        }
        req.flash('success', "Goodbye");
        res.redirect('/campgrounds');
    });
};
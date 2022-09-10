//Loads environment variables from .env file into process.env object
if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

//Require necessary node modules
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const MongoDBStore = require("connect-mongo")(session);

//Set up connection to mongo database
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=> {
    console.log("Database connected");
});

//Create a new instance of express
const app = express();

//setting view engine to ejs
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Parse incoming request body
app.use(express.urlencoded({extended: true}))

//To allow HTTP verbs such as PUT and DELETE
app.use(methodOverride('_method'));

//Serve static files
app.use(express.static(path.join(__dirname, 'public')));

//Prevent MongoDB Operator Injection
//Replace prohibited characters with _
app.use(mongoSanitize({
    replaceWith: '_'
}));


//Store session info on Mongo
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});
store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure:true
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    } 
};
app.use(session(sessionConfig));
app.use(flash());

//sets the content-security-policy header which helps mitigate cross-site scripting attack
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/downnbcia/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//Use passport to add authentication
app.use(passport.initialize());
//persistent login sessions 
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//serialized and deserialize users into session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//setting flash messages to properties on the response object
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//Add routers to the middleware handling path
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

//Handle get request to home page
app.get('/', (req, res) => {
    res.render('home')
});

//A catch all method 
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

//render error page
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', {err});
});


//listen the connections on the specified port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});
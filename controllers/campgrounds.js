//Require necessary modules
const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');

//show all campgrounds
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

//render new campground form
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

//create new campground
module.exports.createCampground = async(req, res, next) => {
    //look up location by name and returns its geographic coordinates
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = (geoData.body.features[0].geometry);
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

//show specific campground and its reviews
module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!campground) {
        req.flash('error', 'Campground does not exist')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
};

//render edit form for campground
module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground) {
        req.flash('error', 'Campground does not exist')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
};

//update campground information 
module.exports.updateCampground = async(req, res) => {
    const {id} = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    //add new images
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.images.push(...imgs);
    //delete image(s) from database and cloudinary 
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        console.log(campground);
    }
    await campground.save();
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`);
};

//delete campground
module.exports.delete = async(req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
};
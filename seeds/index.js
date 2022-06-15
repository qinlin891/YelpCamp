const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers')
const Campground = require('../models/campground')

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=> {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '62a77dabf90c7391c56022c6',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: '    Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur adipisci quisquam, cupiditate eos eligendi quaerat! Nobis quae suscipit in qui, modi reprehenderit id odio dolores cum ex mollitia quia rem?',
            price,
            geometry: {
               type: 'Point',
               coordinates: [ -98.495141, 29.4246 ] 
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/downnbcia/image/upload/v1655234009/YelpCamp/ohkxlp2pjstecjajs3iv.jpg',
                  filename: 'YelpCamp/ohkxlp2pjstecjajs3iv'
                },
                {
                  url: 'https://res.cloudinary.com/downnbcia/image/upload/v1655234010/YelpCamp/mxbb1ieml2rnyt71hajn.jpg',
                  filename: 'YelpCamp/mxbb1ieml2rnyt71hajn'
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});
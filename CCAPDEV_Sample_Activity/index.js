const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/galleryDB')

/* Initialize express */
const express = require('express')
const app = new express()

/* For file uplods */
const fileUpload = require('express-fileupload')

/* Initialize our post */
const Post = require("./database/models/Post")
const path = require('path') // our path directory

app.use(express.json()) // use json
app.use(express.urlencoded( {extended: true})); // files consist of more than strings
app.use(express.static('public')) // we'll add a static directory named "public"
app.use(fileUpload()) // for fileuploads

/* We'll use handlebars for this one */
var hbs = require('hbs')
app.set('view engine','hbs');


app.get('/', function (req, res) {
    res.sendFile(__dirname + '\\' + 'index.html');
});

app.post('/submit-post', function(req, res) {
    const {image} = req.files
    image.mv(path.resolve(__dirname,'public/images',image.name),(error) => {
        if (error)
        {
            console.log ("Error!")
        }
        else
        {
        Post.create({
        ...req.body,
        image:'/images/'+image.name
        });

        res.redirect('/');
        }
    })
});

app.get('/content', async(req,res) => {
    const posts = await Post.find({})
    console.log(posts)
    res.render('content',{posts})
})

var server = app.listen(3000, function () {
    console.log('Node server is running..');
});
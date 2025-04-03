// jshint esversion:6


require("dotenv").config();


const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const homeStartingContent = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";
const aboutContent = "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy.";
const contactContent = "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. ";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB Atlas");
}).catch((err) => {
    console.error("Error connecting to MongoDB Atlas:", err);
});

// Create a schema for posts
const postSchema = new mongoose.Schema({
    title: String,
    content: String
});

// Create a Mongoose model for posts
const Post = mongoose.model("Post", postSchema);

// Home route to fetch and display all posts
app.get("/", async (req, res) => {
    try {
        const posts = await Post.find();
        res.render("home", { StartingContent: homeStartingContent, PostContent: posts });
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while fetching posts.");
    }
});

// About route
app.get("/about", (req, res) => {
    res.render("about", { AboutContent: aboutContent });
});

// Contact route
app.get("/contact", (req, res) => {
    res.render("contact", { ContactContent: contactContent });
});

// Compose route
app.get("/compose", (req, res) => {
    res.render("compose");
});

// Handle new post submission
app.post("/compose", async (req, res) => {
    const post = new Post({
        title: req.body.newTitle,
        content: req.body.newPost
    });

    try {
        await post.save();
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while saving the post.");
    }
});

// Dynamic route for individual posts
// app.get("/posts/:PostName", async (req, res) => {
//     const requestedTitle = _.lowerCase(req.params.PostName);

//     try {
//         const post = await Post.findOne({ title: new RegExp("^" + requestedTitle + "$", "i") });
//         if (post) {
//             res.render("post", {
//                 title: post.title,
//                 content: post.content
//             });
//         } else {
//             res.status(404).send("Post not found.");
//         }
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("An error occurred while fetching the post.");
//     }
// });

app.get("/posts/:postId", async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (post) {
            res.render("post", {
                title: post.title,
                content: post.content
            });
        } else {
            res.status(404).send("Post not found.");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while fetching the post.");
    }
});


// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server started on port 3000");
});

/********************************************************************************
 *  WEB322 – Assignment 05
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: Alec Josef Serrano Student ID: 133592238 Date: July 12, 2024
 *
 *  Published URL: ___________________________________________________________
 *
 ********************************************************************************/

require('dotenv').config();
const legoData = require("./modules/legoSets");
const path = require("path");

const express = require('express');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render("home", { page: '/' }); // Make sure 'page' is set correctly
});


app.get('/about', (req, res) => {
  res.render("about");
});

app.get("/lego/sets", async (req,res)=>{

  let sets = [];

  try{
    if(req.query.theme){
      sets = await legoData.getSetsByTheme(req.query.theme);
    }else{
      sets = await legoData.getAllSets();
    }

    res.render("sets", {sets})
  }catch(err){
    res.status(404).render("404", {message: err});
  }

});

app.get("/lego/sets/:num", async (req,res)=>{
  try{
    let set = await legoData.getSetByNum(req.params.num);
    res.render("set", {set})
  }catch(err){
    res.status(404).render("404", {message: err});
  }
});

app.get('/lego/addSet', async (req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    res.render("addSet", { themes });
  } catch (err) {
    res.status(500).render("500", { message: `Error retrieving themes: ${err}` });
  }
});

app.post('/lego/addSet', async (req, res) => {
  console.log(req.body);  // Log the form data received

  try {
    const newSetData = {
      set_num: req.body.set_num,  // Ensure you include this field to match your database requirement
      name: req.body.name,
      year: req.body.year,
      num_parts: req.body.num_parts,
      img_url: req.body.img_url,
      theme_id: req.body.theme_id
    };
    await legoData.addSet(newSetData); // Use the addSet function from your module
    res.redirect('/lego/sets');
  } catch (error) {
    console.error('Failed to add set:', error);
    res.status(500).render('500', { message: `Error adding set: ${error.message}` });
  }
});


app.get("/lego/editSet/:num", async (req, res) => {
  try {
    const set = await legoData.getSetByNum(req.params.num);
    const themes = await legoData.getAllThemes();
    if (!set) {
      return res.status(404).render("404", { message: "Set not found" });
    }
    res.render("editSet", { set: set, themes: themes });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

app.post("/lego/editSet", async (req, res) => {
  console.log(req.body);  // Log to confirm all data is received correctly
  try {
    if (!req.body.set_num) {
      return res.status(400).render('500', { message: "Missing set number for update." });
    }
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).render('500', { message: `Error updating set: ${err.message}` });
  }
});

app.get("/lego/deleteSet/:num", async (req, res) => {
  try {
    await legoData.deleteSet(req.params.num);
    res.redirect("/lego/sets");
  } catch (err) {
    console.error(err);  // Log the error for debugging
    res.status(500).render('500', { message: `Error deleting set: ${err.message}` });
  }
});

app.use((req, res, next) => {
  res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
});

legoData.initialize().then(()=>{
  app.listen(HTTP_PORT, () => { console.log(`server listening on: ${HTTP_PORT}`) });
});
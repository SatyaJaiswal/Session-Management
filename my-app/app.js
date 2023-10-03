const express = require("express");
const bcrypt = require('bcryptjs');
const session = require("express-session");
const MongoDBSession = require('connect-mongodb-session')(session);
const mongoose = require('mongoose')
const app = express();

const UserModel = require("./models/user")
const mongoURI = 'mongodb://127.0.0.1:27017/sessions'; 

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const store = new MongoDBSession({
  uri: mongoURI,
  collection: "mySessions",
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'Key that will sign cookie',
  resave: false,
  saveUninitialized: false,
  store: store,
}));

const isAuth = (req,res,next)=>{
  if(req.session.isAuth){
    next()
  }else{
    res.redirect('/login')
  }
}


app.get("/",(req,res)=>{
  res.render("home")
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async(req,res)=>{
  const { username, password } = req.body;

  const user = await UserModel.findOne({username});
  if (!user){
    return res.redirect("/login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if(!isMatch){
    return res.redirect("/login");
  }
  req.session.isAuth = true;
  res.redirect("/dashboard");

})

app.get("/signin", (req, res) => {
  res.render("signin");
});

app.post("/signin", async (req, res) => {
  const { username, email, password } = req.body;

  let user = await UserModel.findOne({ email });

  if (user) {
    return res.redirect('/signin');
  }

  const hashedPsw = await bcrypt.hash(password, 12);

  user = new UserModel({
    username,
    email,
    password: hashedPsw
  });

  await user.save();

  res.redirect('/login');
});

app.get("/dashboard", isAuth, (req, res) => {
  res.render("dashboard");
});

app.post("/logout",(req,res)=>{
  req.session.destroy((err)=>{
    if(err)throw err;
    res.redirect("/");
  });
});

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

app.listen(4000, () => {
  console.log("Server Running on http://localhost:4000");
});

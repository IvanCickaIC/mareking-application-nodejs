const express = require('express');
const path = require('path');
const router = express.Router();
const registerValidation = require('../utility/registerValidation');
const verifyEmail  = require('../controllers/verifyEmail');
const sendPasswordRestartLink = require('../controllers/sendPasswordRestartLink');
const emailExtractorFromToken = require('../controllers/restartingPasswordMailExtractor');
const changePassword = require('../controllers/changePassword');
const UserController = require('../controllers/User')
const IngredientsController = require('../controllers/Ingredient')
const CommentController = require('../controllers/Comment')
const CategoryController = require('../controllers/Category')
const ProductController = require('../controllers/Product')


//For Administration
const { Product , Category , Ingredient, ProductIngredients, User, Review } = require('../models'); 
const multer = require('multer');
const { log } = require('console');
// Setup multer for file handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../uploads')); // Save files in the 'uploads' folder
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname); // Save the file with its original name
  }
});
const upload = multer({ storage: storage });


router.get('/',async (req,res) =>{
  console.log(req.session);
  console.log(req.user);

  try {
    let products, categories , ingredients ,productIngredient = []
    products = await Product.findAll({
      include: [
      {model: Category, as: 'category', attributes: ['categoryName']},
      {model: Ingredient, as: 'ingredients',through: { attributes: [] }}
    ]
    });
    
    const logedUser = req.user;

    res.render('index.ejs', { products, logedUser  });
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
})


router.get('/about', (req,res) =>{
  console.log(req.session);
  console.log(req.user);
  const logedUser = req.user;

  res.render('about.ejs' , {logedUser})  
})

router.get('/productDetails/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await Product.findByPk(productId, {
      include: [
        { model: Category, as: 'category', attributes: ['categoryName'] },
        { model: Ingredient, as: 'ingredients', through: { attributes: [] } }
      ]
    });
    
    let comments = [];
    comments = await Review.findAll({
      where: { productId },
      include: [{ model: User, as: 'user', attributes: ['username'] }]
    });
    
    const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
    const averageRating = comments.length > 0 ? (totalRating / comments.length).toFixed(1) : 0;

    const logedUser = req.user
    res.render('productDetails.ejs', { product, comments, averageRating, logedUser });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/gallery', async (req, res) => {
  try {
    // Pronađi sve proizvode u kategoriji 'gallery'
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          where: { categoryName: 'gallery' },
          attributes: ['categoryName']
        }
      ]
    });
    const logedUser = req.user;
    // Renderuj galeriju sa pronađenim proizvodima
    res.render('gallery.ejs', { products, logedUser });
  } catch (error) {
    console.error('Error fetching gallery products:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/contact',(req,res) =>{
  const logedUser = req.user;
  res.render('contact.ejs', {logedUser})  
})


router.post('/submitComment',CommentController.submitComment)


//REGISTRATION ROUTES

// when user try to navigate to /login end point "login.ejs"
router.get('/login',(req,res) =>{
  res.render('login.ejs');
});
//when user post form "login.ejs"
// loginUser - "login.js" = check if user confirm mail
router.post('/login', UserController.loginUser);



// when user try to navigate to /register endpoint
router.get('/register',(req,res) =>{
  res.render('register.ejs')
})
// when user posto form from "register.ejs"
// registerValidation -"registerValidation.js" = contain just validation for register form
// registerUser - "register.js" = also check for validation from register form --
//  create and send mail to validate registration
router.post('/register',registerValidation(),UserController.registerUser);


//when use click on forgot password in login.ejs 
router.get('/mailConfirmation',(req,res) =>{
  res.render('mailConfirmationRestartPassword.ejs')
})


// when user click on the link in the mail for try to restart password
//emailExtractorFromToken - "restartingPasswordMailExtractor.js"
router.get('/restartPassword',emailExtractorFromToken,(req,res) => {
  const email = req.email;
  // console.log("Email that i send :"+email)
  res.render('restartPassword.ejs', { email })
})


// this is called when user try to restart password and click on the link witch appear in mail
// sendPasswordRestartLink - "sendPasswordRestartLink.js"
router.post('/forgotPassword',sendPasswordRestartLink)

// this is called when user try to register and click on the link witch appear in mail
// verifyEmail - "verifyEmail.js"
router.get('/verify_email', verifyEmail)

//this is called from restartPassword.ejs
router.post('/changePassword',changePassword)


//FOR ADMINISTRATION ROUTES

router.get('/admin', async (req, res) => {
  try {
    // Provjera autentifikacije korisnika
    if (!req.user) {
      // Ako korisnik nije autentificiran, preusmjeri ga na stranicu za prijavu
      return res.redirect('/login');
    }
    
    // Provjera da li je korisnik administrator
    if (!req.user.admin) {
      // Ako korisnik nije administrator, prikaži mu poruku da nema dozvolu za pristup
      return res.status(403).send('Nemate dozvolu za pristup administrativnom panelu.');
    }

    // Ako je korisnik autentificiran i administrator, dohvati podatke potrebne za administraciju
    let products, categories, ingredients, productIngredients = [];
    products = await Product.findAll({
      include: [
        { model: Category, as: 'category', attributes: ['categoryName'] },
        { model: Ingredient, as: 'ingredients', through: { attributes: [] } }
      ]
    });
    categories = await Category.findAll();
    ingredients = await Ingredient.findAll();
    productIngredients = await ProductIngredients.findAll();
    
    // Prikazivanje administrativnog panela
    res.render('adminProduct.ejs', { products, categories, ingredients, productIngredients });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


router.post('/createProduct',upload.single('file'),ProductController.createProduct)
router.post('/updateProduct',ProductController.createProduct)
router.post('/createCategory',CategoryController.createCategory)
router.post('/createIngredient',IngredientsController.createIngredient)

router.delete('/deleteProduct/:id',ProductController.deleteProduct)
router.post('/deleteIngredient',IngredientsController.deleteIngredient)
router.post('/deleteCategory',CategoryController.deleteCategory)


router.get('/commentAdmin',async (req,res) =>{

  users = await User.findAll({
    include: [
      {model: Review,as: 'reviews',
        include: [
          {model: Product, as: 'product'}
        ]
      }
    ]
  });
  reviews = await Review.findAll();

  res.render('commentAdmin.ejs',{users,reviews})
})
router.post('/blockUser',UserController.blockUser)
router.delete('/deleteReview',CommentController.deleteComment)

module.exports = router;
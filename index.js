//installing dependencies
import express from "express";
import multer from "multer";
import { dirname} from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";

//initializing
const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));
const saltRounds = 10;

//middlewares
app.use(express.urlencoded({extended:true}));
app.use(express.static('./public'));
app.use(express.static('./uploads'));
app.use(express.json());

//session setup
app.use(
  session({
  secret: 's3cur3S3ss10nS3cr3t',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: 1000 * 60 * 60 //  1 hour
   }
}));

//passport setup
app.use(passport.initialize());
app.use(passport.session());


//database connection setup
const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'inventory',
  password: 'cenation!!',
  port: 5432,
  max: 20, // maximum number of connections in the pool
  idleTimeoutMillis: 30000, // how long a connection can be idle before being closed
  connectionTimeoutMillis: 2000, // how long to wait when establishing a new connection
});

//multer storage setup for uploading images to server uploads folder
const storage = multer.diskStorage({
    destination:'./uploads',
    filename: (req,file,cb) => {
        cb(null,file.originalname);
    }
});

//multer field setup 
const upload = multer({
  storage:storage,
  limits: {
    fileSize: 1024 * 1024 * 5// 5MB
  }}).fields([
    { name: 'img1', maxCount:1 },                
    { name: 'img2', maxCount:1 },
    { name: 'img3', maxCount:1 }, 
    { name: 'img4', maxCount:1 }
]);

//function for querying database
async function queryDB(query, values = []) {
  try {
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
}

const brandQuery = `SELECT DISTINCT brand FROM cars;`;
const carBrands = await queryDB(brandQuery);

//function for loading inventory data
async function loadData () {
  try {
    const query = `SELECT cars.*, car_sellers.first_name, car_sellers.last_name , car_sellers.phone_number, images.img_path1 FROM cars JOIN car_sellers ON cars.car_seller_id = car_sellers.id JOIN images ON cars.image_id = images.id ORDER BY cars.id DESC;`
    const data = await queryDB(query);
    let inventory = data;
    return inventory;
  } catch (error) {
    console.error('error2:', error.message);
  }
};


//rendering home-page
app.get("/", async (req,res) => {
  try {
    res.render("index.ejs", {
        carBrands:  carBrands.map(row => row.brand),
    });
  } catch (error) {
    console.error('error3:', error.message);
  }
});

//rendering inventory-page
app.get("/inventory.page",async (req,res) => {
  try { 
    const [inventory] = await Promise.all([
      loadData(),
    ]);
    res.render("inventory.ejs",{
      inventory,
      carBrands:  carBrands.map(row => row.brand),
    });  
  } catch (error) {
    console.error('error4:', error.message);
  }
});

//search-form-progressive selection functionality
app.post("/models", async (req,res) => {
  try {
    const selectedBrand = req.body.brand;
    const query = `SELECT DISTINCT model FROM cars WHERE brand = $1;`;

    const result = await queryDB(query, [selectedBrand]);
    const models = result.map(row => row.model);

    res.json(models);
  } catch (error) {
    console.error('error5:', error.message);
  }
})

app.post("/years", async (req,res) => {
  try {
    const selectedModel = req.body.model;

    const query = `SELECT DISTINCT year FROM cars WHERE model = $1;`;
    const result = await queryDB(query, [selectedModel]);

    const years = result.map(row => row.year);

    res.send(years);
  } catch (error) {
    console.error('error6:', error.message);
  }
});

//handling search-inventory requests
app.get("/my-cars", async (req, res) => {

  if (req.isAuthenticated()) {
  const idQuery = "SELECT id FROM car_sellers WHERE user_id = $1;" //getting car_seller_id of the logged in user
  const car_seller = await queryDB(idQuery,[req.user.id]);
  const car_seller_id = car_seller[0].id;

  const myCarsQuery = "SELECT cars.*, images.img_path1 FROM cars JOIN images ON cars.image_id = images.id WHERE car_seller_id = $1;" //query for rendering inventory with cars of the logged user

  const [ inventory] = await Promise.all([ //filtering inventory with cars of the logged user along with all carBrands
    (await queryDB(myCarsQuery, [car_seller_id])),
  ]);

  res.render("inventory.ejs", {
    inventory,
    carBrands:  carBrands.map(row => row.brand),
  });

  } else {
    res.redirect("/login");
  }
})

app.get("/search/:brand", async (req, res) => {
  try {
    const { brand } = req.params;
  
    const query = `SELECT cars.*, images.img_path1 FROM images JOIN cars ON cars.image_id = images.id WHERE brand = $1;`;

    const [ inventory] = await Promise.all([
      (await queryDB(query, [brand])), //result.rows
    ]);

    res.render("inventory.ejs", {
      inventory,
      carBrands:  carBrands.map(row => row.brand),
    });

  } catch (error) {
    console.error('error7:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get("/search/:brand/:model", async (req, res) => {
  try {
    const { brand, model } = req.params;
  
    const query = `SELECT cars.*, images.img_path1 FROM images JOIN cars ON cars.image_id = images.id WHERE brand = $1 AND model = $2;`;
    const [ inventory] = await Promise.all([
      (await queryDB(query, [brand, model])), //result.rows
    ]);

    res.render("inventory.ejs", {
      inventory,
      carBrands:  carBrands.map(row => row.brand),  
    })
  } catch (error) {
    console.error('error8:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get("/search/:brand/:model/:year", async (req, res) => {
  try {
    const { brand, model, year } = req.params;
  
    const query = `SELECT cars.*, images.img_path1 FROM images JOIN cars ON cars.image_id = images.id WHERE brand = $1 AND model = $2 AND year = $3;`;
    const [ inventory] = await Promise.all([
      (await queryDB(query, [brand, model, year])), //result.rows
    ]);

    res.render("inventory.ejs", {
      inventory,
      carBrands:  carBrands.map(row => row.brand),
    })
  } catch (error) {
    console.error('error9:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

//rendering car-details-page
app.get("/car-details/:id", async (req,res) => {
  try {
    const id = req.params.id;
    const query = 'SELECT cars.*, car_sellers.first_name, car_sellers.last_name, car_sellers.phone_number, images.img_path1 FROM cars JOIN car_sellers ON cars.car_seller_id = car_sellers.id JOIN images ON cars.image_id = images.id WHERE cars.id = ($1) ORDER BY cars.id DESC;'
    const result = await queryDB(query, [id]);
    const data = result[0];

    res.render("car-details.ejs",{
      data:data,
    })
  } catch (error) {
    console.error('error10:', error.message);
  }
});

app.get("/register", (req,res) => {
  res.render("register.ejs");
});

app.post("/register", async (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const checkUser = await queryDB('SELECT * FROM users WHERE username = ($1)', [username]);
    if (checkUser.length > 0) {
      res.send("User already exists please login");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.log("Error hashing password", err);
        } else {
          console.log("Password hashed successfully");
          const insertQuery = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *;';
          const user = await queryDB(insertQuery, [username, hash]);
          const user2 = user[0];
          await queryDB('INSERT INTO car_sellers (user_id) VALUES ($1)', [user2.id]);
           req.login(user2, (err) => {
             if (err) {
               console.log(err);
             } else {
               res.redirect("/sell.page");
             }
           })
        }
      })
    }
  } catch (error) {
    console.error('error11:', error.message);
  }
})

app.get("/login", (req,res) => {
  res.render("login.ejs");
});

app.post("/login",async (req, res, next) => {
  passport.authenticate('local', (err, user, info) =>  {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render("login.ejs", {
        error: "Invalid Username or Password",
      })    
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.render("index.ejs", {
        user: req.user.username,
        text:"logged in",
        carBrands: carBrands.map(row => row.brand),
      });
    })
    })(req, res, next);
}) 



//rendering sell page
app.get("/sell.page", (req,res) => {
  if (req.isAuthenticated()) {
    res.render("sell.ejs");
  } else {
    res.redirect("/login");
  }
});

//sell page form handler
app.post("/submit", upload, async (req,res) => {

    const img1path = req.files && req.files["img1"] ? `./uploads/${req.files['img1'][0].filename}` : null;
    const img2path = req.files && req.files["img2"] ? `./uploads/${req.files['img2'][0].filename}` : null;
    const img3path = req.files && req.files["img3"] ? `./uploads/${req.files['img3'][0].filename}` : null;
    const img4path = req.files && req.files["img4"] ? `./uploads/${req.files['img4'][0].filename}` : null;

    function processFilePath(filePath) {
      return filePath.replace("./uploads/", "/");
  }
  
    let oldcar = {
        fname:req.body.fname,
        lname:req.body.lname,
        price:req.body.price,
        number:req.body.number,
        year:req.body.year,
        brand:req.body.brand,
        model:req.body.model,
        vin:req.body.vin,
        img1:processFilePath(img1path),
    };

    try {
      const user = await queryDB('SELECT id FROM users WHERE username = ($1)', [req.user.username]);
      const user_id = user[0].id;
      console.log(user_id);

      const updateQuery1 = `UPDATE car_sellers SET first_name = $1, last_name = $2, phone_number = $3 WHERE user_id = $4 RETURNING id;`; 
      const id = await queryDB(updateQuery1,[oldcar.fname,oldcar.lname,oldcar.number,user_id]);
      const insertedSellerId = id[0].id;

      const insertQuery2 = `INSERT INTO images (img_path1) VALUES ($1) RETURNING id;`;
      const imagesResult = await queryDB(insertQuery2, [oldcar.img1]);
      const insertedImageId = imagesResult[0].id;

      const insertQuery3 = `INSERT INTO cars (brand,year,model,vin,price,car_seller_id,image_id) VALUES ($1,$2,$3,$4,$5,$6,$7);`;
      await queryDB(insertQuery3,[oldcar.brand,oldcar.year,oldcar.model,oldcar.vin,oldcar.price,insertedSellerId,insertedImageId]);

      res.redirect("/");
    } catch (error) {
        console.error('error12:', error.message);
    }
});

app.get('/logout', (req, res) => {
  req.logout(req.user, (err) => {
    console.log(err);
  });
  res.redirect('/');
});


passport.use(
  new Strategy(
    async function verify(username, password, cb) {
      try {
        const result = await queryDB('SELECT * FROM users WHERE username = ($1)', [username]);
        if (result.length > 0) {
          const user = result[0];
          const storedHashedPassword = user.password;
          bcrypt.compare(password, storedHashedPassword, (err, result) => {
            if (err) {
              return cb(err);
            } else if (result) {
              return cb(null, user);
            } else {
              return cb(null, false);
            }
          });
          } else {
            return cb("No user found");
          }
        }
       catch (error) {
        console.error('error13:', error.message);
      }}
));

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
})

//server start
app.listen(port,() => {
    console.log("server started");
});

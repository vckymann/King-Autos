//installing dependencies
import express from "express";
import multer from "multer";
import { dirname} from "path";
import { fileURLToPath } from "url";
import pg from "pg";

//initializing
const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

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


//middlewares
app.use(express.urlencoded({extended:true}));
app.use(express.static('./public'));
app.use(express.static('./uploads'));
app.use(express.json());

//multer storage setup for uploading images to server uploads folder
const storage = multer.diskStorage({
    destination:'./uploads',
    filename: (req,file,cb) => {
        cb(null,file.originalname);
    }
});

//multer field setup 
const upload = multer({storage:storage,}).fields([
    { name: 'img1', maxCount:1 },                
    { name: 'img2', maxCount:1 },
    { name: 'img3', maxCount:1 },
    { name: 'img4', maxCount:1 }
]);

async function queryDB(query, values = []) {
  try {
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('error:', error.message);
    throw error;
  }
}

//function for loading inventory data
async function loadData () {
  try {
    const query = `SELECT cars.*, car_sellers.first_name, car_sellers.last_name, car_sellers.email, car_sellers.phone_number, images.img_path1 FROM cars JOIN car_sellers ON cars.car_seller_id = car_sellers.id JOIN images ON cars.image_id = images.id ORDER BY cars.id DESC;`
    const data = await queryDB(query);
    let inventory = data;
    return inventory;
  } catch (error) {
    console.error('error:', error.message);
  }
};

const brandQuery = `SELECT DISTINCT brand FROM cars;`;

//rendering home-page
app.get("/", async (req,res) => {
  try {
    const carBrands = await queryDB(brandQuery);
    res.render("index.ejs", {
        carBrands: carBrands.map(row => row.brand),
    });
  } catch (error) {
    console.error('error:', error.message);
  }
});

//rendering inventory-page
app.get("/inventory.page",async (req,res) => {
  try { 
    const [inventory, carBrands] = await Promise.all([
      loadData(),
      queryDB(brandQuery).then(result => result.map(row => row.brand)),
    ]);
    res.render("inventory.ejs",{
      inventory,
      carBrands,
    });  
  } catch (error) {
    console.error('error:', error.message);
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
    console.error('error:', error.message);
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
    console.error('error:', error.message);
  }
});

//handling search-inventory requests
app.get("/search/:brand", async (req, res) => {
  try {
    const { brand } = req.params;
  
    const query = `SELECT cars.*, images.img_path1 FROM images JOIN cars ON cars.image_id = images.id WHERE brand = $1;`;

    const [ inventory, carBrands] = await Promise.all([
      (await queryDB(query, [brand])), //result.rows
     (await queryDB(brandQuery)).map(row => row.brand),//result2.rows.map(row => row.brand)
    ]);

    res.render("inventory.ejs", {
      inventory,
      carBrands,
    });

  } catch (error) {
    console.error('error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get("/search/:brand/:model", async (req, res) => {
  try {
    const { brand, model } = req.params;
  
    const query = `SELECT cars.*, images.img_path1 FROM images JOIN cars ON cars.image_id = images.id WHERE brand = $1 AND model = $2;`;
    const [ inventory, carBrands] = await Promise.all([
      (await queryDB(query, [brand, model])), //result.rows
     (await queryDB(brandQuery)).map(row => row.brand),//result2.rows.map(row => row.brand)
    ]);

    res.render("inventory.ejs", {
      inventory,
      carBrands,  
    })
  } catch (error) {
    console.error('error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get("/search/:brand/:model/:year", async (req, res) => {
  try {
    const { brand, model, year } = req.params;
  
    const query = `SELECT cars.*, images.img_path1 FROM images JOIN cars ON cars.image_id = images.id WHERE brand = $1 AND model = $2 AND year = $3;`;
    const [ inventory, carBrands] = await Promise.all([
      (await queryDB(query, [brand, model, year])), //result.rows
     (await queryDB(brandQuery)).map(row => row.brand),//result2.rows.map(row => row.brand)
    ]);

    res.render("inventory.ejs", {
      inventory,
      carBrands,
    })
  } catch (error) {
    console.error('error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

//rendering car-details-page
app.get("/car-details/:id", async (req,res) => {
  try {
    const id = req.params.id;
    const query = 'SELECT cars.*, car_sellers.first_name, car_sellers.last_name, car_sellers.email, car_sellers.phone_number, images.img_path1 FROM cars JOIN car_sellers ON cars.car_seller_id = car_sellers.id JOIN images ON cars.image_id = images.id WHERE cars.id = ($1) ORDER BY cars.id DESC;'
    const result = await queryDB(query, [id]);
    const data = result[0];

    res.render("car-details.ejs",{
      data:data,
    })
  } catch (error) {
    console.error('error:', error.message);
  }
});

//rendering sell page
app.get("/sell.page", (req,res) => {
  res.render("sell.ejs");
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
        email:req.body.email,
        number:req.body.number,
        year:req.body.year,
        brand:req.body.brand,
        model:req.body.model,
        vin:req.body.vin,
        img1:processFilePath(img1path),
    };

    try {
      const insertQuery1 = `INSERT INTO car_sellers (first_name,last_name,email,phone_number) VALUES ($1,$2,$3,$4) RETURNING id;`; 
      const id = await queryDB(insertQuery1,[oldcar.fname,oldcar.lname,oldcar.email,oldcar.number,]);
      const insertedSellerId = id[0].id;

      const insertQuery2 = `INSERT INTO images (img_path1) VALUES ($1) RETURNING id;`;
      const imagesResult = await queryDB(insertQuery2, [oldcar.img1]);
      const insertedImageId = imagesResult[0].id;

      const insertQuery3 = `INSERT INTO cars (brand,year,model,vin,car_seller_id,image_id) VALUES ($1,$2,$3,$4,$5,$6);`;
      await queryDB(insertQuery3,[oldcar.brand,oldcar.year,oldcar.model,oldcar.vin,insertedSellerId,insertedImageId]);

      res.redirect("/");
    } catch (error) {
        console.error('error:', error.message);
    }
});

//server start
app.listen(port,() => {
    console.log("server started");
});
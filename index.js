import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import { dirname} from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import axios from "axios";

const DATA_FILE_PATH = './car-data/data.json';

const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'inventory',
  password: 'cenation!!',
  port: 5432
});
db.connect();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('./public'));
app.use(express.static('./uploads'));

const storage = multer.diskStorage({
    destination:'./uploads',
    filename: (req,file,cb) => {
        cb(null,file.originalname);
    }
});

const upload = multer({storage:storage,}).fields([
    { name: 'img1', maxCount:1 },                
    { name: 'img2', maxCount:1 },
    { name: 'img3', maxCount:1 },
    { name: 'img4', maxCount:1 }
]);

async function loadData () {
  try {
    const data = await db.query('SELECT cars.*, car_sellers.first_name, car_sellers.last_name, car_sellers.email, car_sellers.phone_number, images.img_path1 FROM cars JOIN car_sellers ON cars.car_seller_id = car_sellers.id JOIN images ON cars.image_id = images.id ORDER BY cars.id DESC;');
    let inventory = data.rows;
    return inventory;
  } catch (error) {
    console.error('error:', error.message);
  }
};

app.get("/", (req,res) => {
    res.render("index.ejs");
});

app.get("/inventory.page",async (req,res) => {
  const inventory = await loadData();
  console.log(inventory);
  res.render("inventory.ejs",{
    inventory
  });
});

app.get("/car-details/:id", async (req,res) => {
  const id = req.params.id;
  try {
    const result = await db.query('SELECT cars.*, car_sellers.first_name, car_sellers.last_name, car_sellers.email, car_sellers.phone_number, images.img_path1 FROM cars JOIN car_sellers ON cars.car_seller_id = car_sellers.id JOIN images ON cars.image_id = images.id WHERE cars.id = ($1) ORDER BY cars.id DESC;', [id]);
    const data = result.rows[0];
    console.log(data);
    res.render("car-details.ejs",{
      data:data,
    })
  } catch (error) {
    console.error('error:', error.message);
  }
})

//sell page

app.get("/sell.page",(req,res) => {
  res.render("sell.ejs");
});

app.post("/submit", upload, async (req,res) => {

    const img1path = req.files && req.files["img1"] ? `./uploads/${req.files['img1'][0].filename}` : null;
    const img2path = req.files && req.files["img2"] ? `./uploads/${req.files['img2'][0].filename}` : null;
    const img3path = req.files && req.files["img3"] ? `./uploads/${req.files['img3'][0].filename}` : null;
    const img4path = req.files && req.files["img4"] ? `./uploads/${req.files['img4'][0].filename}` : null;

    function processFilePath(filePath) {
      return filePath.replace("./uploads/", "./");
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

      const id = await db.query(`INSERT INTO car_sellers (first_name,last_name,email,phone_number) VALUES ($1,$2,$3,$4) RETURNING id`,[
      oldcar.fname,
      oldcar.lname,
      oldcar.email,
      oldcar.number,
    ]);

    const insertedSellerId = id.rows[0].id;

    const imagesResult = await db.query('INSERT INTO images (img_path1) VALUES ($1) RETURNING id', [
      oldcar.img1,
    ]);

    const insertedImageId = imagesResult.rows[0].id;

      await db.query(`INSERT INTO cars (brand,year,model,vin,car_seller_id,image_id) VALUES ($1,$2,$3,$4,$5,$6)`,[
        oldcar.brand,
        oldcar.year,
        oldcar.model,
        oldcar.vin,
        insertedSellerId,
        insertedImageId,
    ]);

    } catch (error) {
        console.error('error:', error.message);
    }
    res.redirect("/")
});

app.listen(port,() => {
    console.log("server started");
});
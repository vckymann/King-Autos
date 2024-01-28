import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import { dirname} from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

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

let sellCars = [];

app.get("/",(req,res) => {
    res.sendFile(__dirname + '/public/dist/index.html');
});
app.get("/sell.html",(req,res) => {
    res.sendFile(__dirname + '/public/dist/sell.html');
});

app.post("/submit", upload, (req,res) => {

    const img1path = req.files && req.files["img1"] ? `./uploads/${req.files['img1'][0].filename}` : null;
    const img2path = req.files && req.files["img2"] ? `./uploads/${req.files['img2'][0].filename}` : null;
    const img3path = req.files && req.files["img3"] ? `./uploads/${req.files['img3'][0].filename}` : null;
    const img4path = req.files && req.files["img4"] ? `./uploads/${req.files['img4'][0].filename}` : null;

    let oldcar = {
        fname:req.body.fname,
        lname:req.body.lname,
        email:req.body.email,
        number:req.body.number,
        year:req.body.year,
        make:req.body.make,
        model:req.body.model,
        vin:req.body.vin,
        img1:img1path,
        img2:img2path,
        img3:img3path,
        img4:img4path,
    };
    
    sellCars.push(oldcar);
    console.log(oldcar);
    res.redirect("/")
});

app.listen(port,() => {
    console.log("server started");
});
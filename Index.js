const express = require("express");

// const bodyParser = require("body-parser");

const cors = require("cors");

const admin = require("firebase-admin");

require("dotenv").config();

// Database Credential:
const dataBaseUser = process.env.DB_USER;
const dataBasePass = process.env.DB_PASS;

// console.log(process.env.DB_PASS);
const app = express();
app.use(cors());

app.use(express.json());

// Firebase Admin staffs:
var serviceAccount = require("./Configs/burj-al-arab-48dca-firebase-adminsdk-8lw26-a6ebc1763d.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Mongo dbs Staffs:
const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${dataBaseUser}:${dataBasePass}@cluster0.ya1bp.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Connection with the server:
client.connect((err) => {
  // Db collection:
  const bookings = client.db("burjAlArab").collection("bookings");

  console.log("Db connectiion success");

  // Sending data To DB:
  app.post("/addBookings", (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // Reading the data:
  app.get("/bookings", (req, res) => {
    // console.log(req.headers.authorization);

    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1];
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;

          console.log(tokenEmail, queryEmail);

          if (tokenEmail == queryEmail) {
            // In this find section we are taking the user email and
            // find the data of that user to show his / her data in the ui:
            bookings.find({ email: queryEmail }).toArray((err, documents) => {
              res.status(200).send(documents);
            });
          } else {
            res.status(401).send("Unauthorized User !! Jha Vhaggggggg");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      res.status(401).send("Unauthorized User !! Jha Vhaggggggg");
    }
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(5000);

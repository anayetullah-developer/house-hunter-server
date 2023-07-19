const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const mongoose = require('mongoose');
const User = require('./models/users')
const bcrypt = require('bcryptjs')



//middleware
require("dotenv").config();
app.use(cors());
app.use(express.json());

//Connect MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kkdykse.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(uri)


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri1 = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kkdykse.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri1, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const houseCollection = client.db("house-hunter").collection("houses");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);


app.post("/register", async (req, res) => {
  try {
    const newPassword = await bcrypt.hash(req.body.password, 10)
    const user = await User.create({
			name: req.body.name,
			email: req.body.email,
			password: newPassword,
      role: req.body.role
		})
    res.json({ status: 'ok' })
  }

	catch (err) {
		res.json({ status: 'error', error: 'Duplicate email' })
	}
})

app.post('/login', async (req, res) => {
	const user = await User.findOne({
		email: req.body.email,
	})

	if (!user) {
		return { status: 'error', error: 'Invalid login' }
	}

	const isPasswordValid = await bcrypt.compare(
		req.body.password,
		user.password
	)

	if (isPasswordValid) {
		const token = jwt.sign(
			{
				email: user.email,
				role: user.role
			},
			'secret123'
		)

		return res.json({ status: 'ok', user: token })
	} else {
		return res.json({ status: 'error', user: false })
	}
})


//House owner apis

app.post("/house-owner/addHouse", async (req, res) => {
	const houseInfo = req.body;
	const result = await houseCollection.insertOne(houseInfo);
	console.log(result);
	res.send(result);
  });

  app.get("/house-owner/myHouses", async (req, res) => {
	const email = req.query.email;
	if(!email) {
	  res.send([])
	}
	const query = {email: email}
	const result = await houseCollection.find(query).toArray();
	res.send(result);
  });

  app.delete("/my-houses/selected-house/:id", async (req, res) => {
	const id = req.params.id;
	const query = { _id: new ObjectId(id) };
	const result = await houseCollection.deleteOne(query);
	res.send(result);
  
  });

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.listen(port, () => {
  console.log("Server is running on port", port);
});

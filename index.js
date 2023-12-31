const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5001;
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
      		role: req.body.role,
      		phone: req.body.phone
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
				phone: user.phone,
				name: user.name,
				role: user.role
			},
			'secret123'
		)

		return res.json({ status: 'ok', user: token })
	} else {
		return res.json({ status: 'error', user: false })
	}
})


//Client side apis - Home page
app.get("/houses", async (req, res) => {
	const result = await houseCollection.find().toArray();
	res.send(result);
  });


//Dashboard apis - House owner 

app.post("/house-owner/addHouse", async (req, res) => {
	const houseInfo = req.body;
	const result = await houseCollection.insertOne(houseInfo);
	console.log(result);
	res.send(result);
  });

  app.get("/house-owner/myHouses", async (req, res) => {
	const phone = req.query.phone;
	if(!phone) {
	  res.send([])
	}
	const query = {phone: phone}
	const result = await houseCollection.find(query).toArray();
	res.send(result);
  });

  app.delete("/my-houses/selected-house/:id", async (req, res) => {
	const id = req.params.id;
	const query = { _id: new ObjectId(id) };
	const result = await houseCollection.deleteOne(query);
	res.send(result);
  
  });

  app.get("/house-owner/myHouses/:id", async (req, res) => {
	const id = req.params.id;
	const query = { _id: new ObjectId(id) };
	const result = await houseCollection.findOne(query);
	res.send(result);
  });

  app.patch("/house-owner/updateHouse/:id", async (req, res) => {
	const id = req.params.id;
	const body = req.body;
	console.log(body);
	const query = { _id: new ObjectId(id) };
	const updateClass = {
	  $set: {
		name: body.name,
		photoURL: body.photoURL,
		bathrooms: body.bathrooms,
		bedrooms: body.bedrooms,
		size: body.size,
		city: body.city,
		date: body.date,
		address: body.address,
		rent: body.rent,
		desc: body.desc,
	  },
	};
	const result = await houseCollection.updateOne(query, updateClass);
	res.send(result);
  });
  

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.listen(port, () => {
  console.log("Server is running on port", port);
});

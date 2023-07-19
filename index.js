const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const mongoose = require('mongoose');
const User = require('./models/users')
const bcrypt = require('bcryptjs')


//middleware
app.use(cors());
app.use(express.json());
require("dotenv").config();

//Connect MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kkdykse.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(uri)

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



app.get("/", (req, res) => {
  res.send("Server is working");
});

app.listen(port, () => {
  console.log("Server is running on port", port);
});

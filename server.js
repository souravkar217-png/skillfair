const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(bodyParser.json());

/* HOME ROUTE */
app.get("/", (req, res) => {
    res.send("SkillFair Backend is Running 🚀");
});

/* EMAIL TRANSPORTER */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/* REGISTER API */
app.post("/register", async (req, res) => {
    try {
        const { name, email, course, sem, project, place } = req.body;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Skill Fair Registration Successful",
            html: `
                <h2>Registration Successful</h2>
                <p><b>Name:</b> ${name}</p>
                <p><b>Course:</b> ${course}</p>
                <p><b>Semester:</b> ${sem}</p>
                <p><b>Project:</b> ${project}</p>
                <p><b>Place:</b> ${place}</p>
                <h3>Thank You For Participating!</h3>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: "Registration Successful"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});

/* SERVER */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

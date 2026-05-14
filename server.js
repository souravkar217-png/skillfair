const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const excelJS = require("exceljs");
const puppeteer = require("puppeteer");
const fs = require("fs");

const app = express();

// =========================
// MIDDLEWARE
// =========================
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// =========================
// EXCEL SETUP
// =========================
const workbook = new excelJS.Workbook();
const worksheet = workbook.addWorksheet("Skill Fair Students");

worksheet.columns = [
    { header: "Student Name", key: "name", width: 30 },
    { header: "Email", key: "email", width: 35 },
    { header: "Course", key: "course", width: 20 },
    { header: "Sem / Year", key: "sem", width: 20 },
    { header: "Project", key: "project", width: 35 },
    { header: "Place", key: "place", width: 30 }
];

// =========================
// HOME
// =========================
app.get("/", (req, res) => {
    res.send("Server Running...");
});

// =========================
// CERTIFICATE HTML GENERATOR
// =========================
function generateHTML(data) {
    const { name, course, sem, project, place } = data;

    const date = new Date().toLocaleDateString();

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&family=Great+Vibes&display=swap" rel="stylesheet">

<style>
body{
    margin:0;
    background:#eee;
}
.certificate{
    width:1200px;
    height:850px;
    margin:auto;
    background:white;
    position:relative;
    border:15px solid #0f2a5a;
    box-shadow:0 0 40px rgba(0,0,0,0.2);
    padding:50px;
}

.header{
    text-align:center;
    font-family:Poppins;
}

.header h1{
    margin:0;
    font-size:40px;
    color:#0f2a5a;
}

.title{
    text-align:center;
    font-size:70px;
    color:#0f2a5a;
    margin-top:30px;
    font-weight:700;
}

.sub{
    text-align:center;
    font-size:20px;
    margin-top:10px;
}

.name{
    text-align:center;
    font-size:60px;
    color:#dc2626;
    font-family:"Great Vibes";
    margin-top:40px;
}

.details{
    margin-top:40px;
    text-align:center;
    font-size:20px;
}

.box{
    width:70%;
    margin:30px auto;
    padding:20px;
    border:2px solid #ccc;
    border-radius:10px;
}

.footer{
    position:absolute;
    bottom:60px;
    width:100%;
    text-align:center;
}

.date{
    position:absolute;
    bottom:30px;
    left:60px;
}

.signature{
    position:absolute;
    bottom:30px;
    right:60px;
}
</style>

</head>

<body>

<div class="certificate">

    <div class="header">
        <h1>GEORGE TELEGRAPH</h1>
        <p>Skill Fair & Computer Application Department</p>
    </div>

    <div class="title">CERTIFICATE</div>
    <div class="sub">OF PARTICIPATION</div>

    <div class="details">This is to certify that</div>

    <div class="name">${name}</div>

    <div class="details">
        has successfully participated in Skill Fair Project Presentation
    </div>

    <div class="box">
        <p><b>Course:</b> ${course}</p>
        <p><b>Project:</b> ${project}</p>
        <p><b>Semester:</b> ${sem}</p>
        <p><b>Place:</b> ${place}</p>
    </div>

    <div class="footer">
        <h3>Congratulations on Your Achievement!</h3>
    </div>

    <div class="date">Date: ${date}</div>
    <div class="signature">Director Signature</div>

</div>

</body>
</html>
    `;
}

// =========================
// REGISTER ROUTE
// =========================
app.post("/register", async (req, res) => {

    try {
        const { name, email, course, sem, project, place } = req.body;

        if (!name || !email || !course || !sem || !project || !place) {
            return res.status(400).send("All Fields Required");
        }

        // =========================
        // SAVE TO EXCEL
        // =========================
        worksheet.addRow({ name, email, course, sem, project, place });
        await workbook.xlsx.writeFile("students.xlsx");

        console.log("Excel Saved");

        // =========================
        // PDF GENERATION USING PUPPETEER
        // =========================
        const browser = await puppeteer.launch({
            headless: "new"
        });

        const page = await browser.newPage();

        const html = generateHTML({ name, course, sem, project, place });

        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdfName = `${name}_certificate.pdf`;

        await page.pdf({
            path: pdfName,
            format: "A4",
            landscape: true,
            printBackground: true
        });

        await browser.close();

        // =========================
        // EMAIL SEND
        // =========================
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "YOUR_GMAIL@gmail.com",
                pass: "YOUR_APP_PASSWORD"
            }
        });

        await transporter.sendMail({
            from: "YOUR_GMAIL@gmail.com",
            to: email,
            subject: "Skill Fair Certificate",
            text: "Your certificate is attached.",
            attachments: [
                {
                    filename: pdfName,
                    path: "./" + pdfName
                }
            ]
        });

        res.send("Registration Successful + Certificate Sent!");

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

// =========================
// START SERVER
// =========================
app.listen(3000, () => {
    console.log("Server running on port 3000");
});

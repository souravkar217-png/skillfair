const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const excelJS = require("exceljs");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

/* =========================
   EXCEL SETUP
========================= */

const workbook = new excelJS.Workbook();
const worksheet = workbook.addWorksheet("Skill Fair Students");

worksheet.columns = [
  { header: "Student Name", key: "name", width: 30 },
  { header: "Email", key: "email", width: 35 },
  { header: "Course", key: "course", width: 25 },
  { header: "Semester", key: "sem", width: 20 },
  { header: "Project", key: "project", width: 35 },
  { header: "Place", key: "place", width: 30 },
];

const EXCEL_FILE = "students.xlsx";

/* =========================
   CERTIFICATE HTML
========================= */

function generateHTML(data) {

  const { name, course, sem, project, place } = data;

  const date = new Date().toLocaleDateString();

  return `
<!DOCTYPE html>
<html>

<head>

<meta charset="utf-8">

<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">

<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{
    width:100%;
    height:100vh;
    background:#f5f5f5;
    font-family:'Poppins',sans-serif;
}

.certificate{
    width:1400px;
    height:900px;
    background:white;
    margin:auto;
    position:relative;
    overflow:hidden;
    border:20px solid #0f172a;
}

/* TOP HEADER */

.top{
    height:180px;
    background:#0f172a;
    color:white;
    text-align:center;
    padding-top:30px;
}

.top h1{
    font-size:42px;
    letter-spacing:2px;
}

.top h3{
    margin-top:10px;
    font-size:22px;
    font-weight:400;
}

/* TITLE */

.title{
    text-align:center;
    margin-top:50px;
}

.title h2{
    font-size:80px;
    color:#0f172a;
    font-weight:700;
    letter-spacing:5px;
}

.title p{
    font-size:28px;
    color:#555;
    margin-top:10px;
}

/* CONTENT */

.content{
    text-align:center;
    margin-top:60px;
    padding:0 100px;
}

.present{
    font-size:32px;
    color:#444;
}

.name{
    margin:35px 0;
    font-size:85px;
    color:#dc2626;
    font-weight:700;
    border-bottom:4px solid #0f172a;
    display:inline-block;
    padding:10px 50px;
}

.desc{
    font-size:32px;
    line-height:1.8;
    color:#333;
}

.course{
    color:#2563eb;
    font-weight:700;
}

/* DETAILS BOX */

.details{
    width:75%;
    margin:50px auto 0;
    border:3px solid #d1d5db;
    border-radius:15px;
    padding:35px;
    text-align:left;
    background:#fafafa;
}

.details p{
    font-size:24px;
    margin-bottom:18px;
    color:#111827;
}

.details b{
    color:#0f172a;
}

/* FOOTER */

.footer{
    position:absolute;
    bottom:50px;
    left:0;
    width:100%;
    display:flex;
    justify-content:space-around;
    align-items:center;
}

.sign{
    text-align:center;
}

.line{
    width:260px;
    border-top:3px solid #000;
    margin-bottom:12px;
}

.sign p{
    font-size:20px;
    font-weight:600;
}

.date{
    position:absolute;
    left:60px;
    bottom:60px;
    font-size:18px;
    font-weight:500;
}

.achievement{
    position:absolute;
    bottom:15px;
    width:100%;
    text-align:center;
    font-size:24px;
    color:#1e3a8a;
    font-weight:700;
}

/* GOLD SEAL */

.seal{
    position:absolute;
    right:70px;
    bottom:120px;
    width:160px;
    height:160px;
    border-radius:50%;
    border:12px solid gold;
}

</style>

</head>

<body>

<div class="certificate">

    <div class="top">
        <h1>THE GEORGE TELEGRAPH TRAINING INSTITUTE</h1>
        <h3>MIDNAPORE CENTRE</h3>
    </div>

    <div class="title">
        <h2>CERTIFICATE</h2>
        <p>OF PARTICIPATION</p>
    </div>

    <div class="content">

        <div class="present">
            This is to certify that
        </div>

        <div class="name">
            ${name}
        </div>

        <div class="desc">
            has successfully participated in
            <span class="course">
            Skill Fair Project Presentation
            </span>
        </div>

    </div>

    <div class="details">

        <p><b>Course:</b> ${course}</p>

        <p><b>Semester:</b> ${sem}</p>

        <p><b>Project:</b> ${project}</p>

        <p><b>Place:</b> ${place}</p>

    </div>

    <div class="date">
        Date: ${date}
    </div>

    <div class="footer">

        <div class="sign">
            <div class="line"></div>
            <p>Coordinator</p>
        </div>

        <div class="sign">
            <div class="line"></div>
            <p>Director</p>
        </div>

    </div>

    <div class="seal"></div>

    <div class="achievement">
        Congratulations on Your Achievement!
    </div>

</div>

</body>
</html>
`;
}

/* =========================
   REGISTER API
========================= */

app.post("/register", async (req, res) => {

  try {

    const {
      name,
      email,
      course,
      sem,
      project,
      place
    } = req.body;

    /* VALIDATION */

    if (
      !name ||
      !email ||
      !course ||
      !sem ||
      !project ||
      !place
    ) {

      return res.status(400).json({
        success: false,
        message: "All Fields Required"
      });

    }

    /* SAVE TO EXCEL */

    worksheet.addRow({
      name,
      email,
      course,
      sem,
      project,
      place
    });

    await workbook.xlsx.writeFile(EXCEL_FILE);

    /* GENERATE PDF */

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox"
      ]
    });

    const page = await browser.newPage();

    const html = generateHTML({
      name,
      course,
      sem,
      project,
      place
    });

    await page.setViewport({
      width: 1400,
      height: 900,
      deviceScaleFactor: 2
    });

    await page.setContent(html, {
      waitUntil: "networkidle0"
    });

    const pdfName = `${name}_certificate.pdf`;

    const pdfPath = path.join(__dirname, pdfName);

    await page.pdf({
      path: pdfPath,
      format: "A4",
      landscape: true,
      printBackground: true,
      preferCSSPageSize: true
    });

    await browser.close();

    /* EMAIL TRANSPORTER */

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
      }
    });

    /* SEND EMAIL */

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Skill Fair Certificate",
      text: "Congratulations! Your certificate is attached.",
      attachments: [
        {
          filename: pdfName,
          path: pdfPath
        }
      ]
    });

    /* DELETE PDF AFTER SEND */

    fs.unlinkSync(pdfPath);

    /* SUCCESS RESPONSE */

    res.status(200).json({
      success: true,
      message: "Registration Successful + Certificate Sent!"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

});

/* =========================
   HOME ROUTE
========================= */

app.get("/", (req, res) => {

  res.send("Skill Fair Backend Running Successfully");

});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("Server running on port", PORT);

});

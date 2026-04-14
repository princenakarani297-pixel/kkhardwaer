// ================= IMPORTS =================
const express = require("express");
const nodemailer = require("nodemailer");
const fs = require("fs");
const cors = require("cors");
require("dotenv").config(); // 🔐 ENV support

// ================= APP =================
const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
    res.send("✅ Server Running Successfully");
});

// ================= MAIN API =================
app.post("/send", async (req, res) => {
    try {
        console.log("📩 Incoming Data:", req.body);

        const data = req.body;

        // ===== SAVE DATA IN FILE (SAFE) =====
        try {
            let existing = [];

            if (fs.existsSync("data.json")) {
                existing = JSON.parse(fs.readFileSync("data.json"));
            }

            data.date = new Date().toLocaleString();
            existing.push(data);

            fs.writeFileSync("data.json", JSON.stringify(existing, null, 2));
        } catch (fileErr) {
            console.log("⚠️ File Save Error:", fileErr.message);
        }

        // ===== EMAIL HTML =====
        let rows = Object.keys(data).map(key => `
            <tr>
                <td style="padding:10px;border:1px solid #ddd;"><b>${key}</b></td>
                <td style="padding:10px;border:1px solid #ddd;">${data[key]}</td>
            </tr>
        `).join("");

        let html = `
        <div style="font-family:Arial;padding:20px;background:#f4f4f4">
            <h2>New Customer Inquiry</h2>
            <table style="border-collapse:collapse;width:100%;background:#fff">
                ${rows}
            </table>
            <p style="font-size:12px;color:#777;margin-top:10px">
                Auto-generated from website
            </p>
        </div>
        `;

        // ===== EMAIL CONFIG (BEST PRACTICE) =====
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,   // 🔐 from .env
                pass: process.env.EMAIL_PASS    // 🔐 from .env
            }
        });

        // ===== VERIFY CONNECTION =====
        await transporter.verify();

        // ===== SEND MAIL =====
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "🆕 New Inquiry - KK Hardware",
            html: html
        });

        res.json({ message: "✅ Email Sent Successfully" });

    } catch (err) {
        console.log("❌ FULL ERROR:", err);
        res.status(500).json({ message: "Error", error: err.message });
    }
});

// ================= START SERVER =================
app.listen(3001, () => {
    console.log("🚀 Server running at http://localhost:3001");
});
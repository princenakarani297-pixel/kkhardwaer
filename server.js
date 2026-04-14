// ================= IMPORTS =================
const express = require("express");
const nodemailer = require("nodemailer");
const fs = require("fs");
const cors = require("cors");

// ================= APP =================
const app = express();

app.use(express.json());
app.use(cors());

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
    res.send("✅ Server Running Successfully");
});

// ================= MAIN API =================
app.post("/send", async (req, res) => {
    try {
        console.log("📩 Incoming Data:", req.body);

        const data = req.body;

        // ===== BASIC VALIDATION =====
        if (!data.Name || !data.Email || !data["Mobile No"] || !data.Message) {
            return res.status(400).json({ message: "All fields required" });
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
        </div>
        `;

        // ===== EMAIL CONFIG (FIXED) =====
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // 🔥 important
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // ===== VERIFY CONNECTION =====
        await transporter.verify();
        console.log("✅ SMTP Ready");

        // ===== SEND MAIL =====
        await transporter.sendMail({
            from: `"KK Hardware" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: "🆕 New Inquiry - KK Hardware",
            html: html
        });

        console.log("✅ Mail Sent Successfully",info);

        res.json({ message: "✅ Success" });

    } catch (err) {
        console.error("❌ ERROR:", err);
        res.status(500).json({
            message: "Mail Failed",
            error: err.message
        });
    }
});

// ================= START SERVER =================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

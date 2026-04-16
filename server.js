// ================= IMPORTS =================
const express = require("express");
const nodemailer = require("nodemailer");
const fs = require("fs");
const cors = require("cors");

// ================= APP =================
const app = express();

app.use(express.json());
app.use(cors());

// ================= FILE PATH =================
const filePath = "/tmp/data.json"; // 🔥 Render safe

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
    res.send("✅ Server Running Successfully");
});

// ================= MAIN API =================
app.post("/send", async (req, res) => {
    try {
        console.log("📩 Incoming Data:", req.body);

        const data = req.body;

        // ===== VALIDATION =====
        if (!data.Name || !data.Email || !data["Mobile No"] || !data.Message) {
            return res.status(400).json({ message: "❌ All fields required" });
        }

        // ===== READ OLD DATA =====
        let existingData = [];
        if (fs.existsSync(filePath)) {
            existingData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        }

        // ===== ADD NEW DATA =====
        existingData.push({
            ...data,
            date: new Date().toLocaleString()
        });

        // ===== SAVE FILE =====
        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
        console.log("✅ Data saved in /tmp/data.json");

        // ===== READ LATEST ENTRY =====
        const latest = existingData[existingData.length - 1];

        // ===== HTML FORMAT =====
        let rows = Object.keys(latest).map(key => `
            <tr>
                <td style="padding:10px;border:1px solid #ddd;"><b>${key}</b></td>
                <td style="padding:10px;border:1px solid #ddd;">${latest[key]}</td>
            </tr>
        `).join("");

        let html = `
        <div style="font-family:Arial;padding:20px;background:#f4f4f4">
            <h2>🆕 New Customer Inquiry</h2>
            <table style="border-collapse:collapse;width:100%;background:#fff">
                ${rows}
            </table>
        </div>
        `;

        // ===== EMAIL CONFIG =====
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // ===== DEBUG =====
        console.log("EMAIL_USER:", process.env.EMAIL_USER);
        console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "EXISTS" : "MISSING");

        // ===== VERIFY =====
        await transporter.verify();
        console.log("✅ SMTP Ready");

        // ===== SEND MAIL =====
        let info = await transporter.sendMail({
            from: `"KK Hardware" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: "🆕 New Inquiry - KK Hardware",
            html: html
        });

        console.log("✅ Mail Sent:", info.response);

        res.json({
            message: "✅ Mail Sent Successfully",
            file: "/tmp/data.json"
        });

    } catch (err) {
        console.error("❌ ERROR:", err);

        res.status(500).json({
            message: "❌ Mail Failed",
            error: err.message
        });
    }
});

// ================= START SERVER =================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

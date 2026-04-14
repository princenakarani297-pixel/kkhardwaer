// ================= IMPORTS =================
const express = require("express");
const nodemailer = require("nodemailer");
const fs = require("fs");
const cors = require("cors");

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

        // ===== SAVE DATA IN FILE =====
        let existing = [];

        if (fs.existsSync("data.json")) {
            try {
                existing = JSON.parse(fs.readFileSync("data.json"));
            } catch {
                existing = [];
            }
        }

        data.date = new Date().toLocaleString();
        existing.push(data);

        fs.writeFileSync("data.json", JSON.stringify(existing, null, 2));

        // ===== EMAIL HTML =====
        let rows = Object.keys(data).map(key => `
            <tr>
                <td style="padding:10px;border:1px solid #ddd;"><b>${key}</b></td>
                <td style="padding:10px;border:1px solid #ddd;">${data[key]}</td>
            </tr>
        `).join("");

        let html = `
        <div style="font-family:Arial;padding:20px;background:#f4f4f4">
            <h2>🛠 New Customer Inquiry</h2>
            <table style="border-collapse:collapse;width:100%;background:#fff">
                ${rows}
            </table>
            <p style="font-size:12px;color:#777;margin-top:10px">
                Auto-generated from website
            </p>
        </div>
        `;

        // ===== EMAIL CONFIG =====
       let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "kkhardware2309@gmail.com",
        pass: "hvli hrwm yhsb hrjv"
    }
});

        // ===== SEND MAIL =====
        await transporter.sendMail({
            from: "kkhardware2309@gmail.com",
            to: "kkhardware2309@gmail.com",
            subject: "🆕 New Inquiry - KK Hardware",
            html: html
        });

        res.json({ message: "✅ Success" });

    } catch (err) {
        console.log("❌ ERROR:", err);
        res.status(500).json({ message: "Error", error: err.message });
    }
});

// ================= START SERVER =================
app.listen(3001, () => {
    console.log("🚀 Server running at http://localhost:3001");
});

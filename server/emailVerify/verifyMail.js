import nodemailer from "nodemailer"
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from "url"
import Handlebars from "handlebars"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const verifyMail = async (token, email) => {

    const emailTemplateSource = fs.readFileSync(
        path.join(__dirname, "template.hbs"),
        "utf-8"
    )

    const template = Handlebars.compile(emailTemplateSource)
    const htmlToSend = template({
        token: encodeURIComponent(token),
        frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    })

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    })

    const mailConfigurations = {
        from: process.env.MAIL_USER,
        to: email,
        subject: "Email Verification",
        html: htmlToSend
    }

    const info = await transporter.sendMail(mailConfigurations)
    console.log("Email sent successfully:", info.messageId)
}
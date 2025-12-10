import { NextAuthOptions } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import nodemailer from "nodemailer"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: false, // Port 587 uses STARTTLS, not SSL
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const { host } = new URL(url)
        const transport = nodemailer.createTransport(provider.server)
        
        const result = await transport.sendMail({
          to: email,
          from: provider.from,
          subject: `Ahura Gold ERP - Giriş Kodu`,
          text: text({ url, host }),
          html: html({ url, host }),
        })
        
        const failed = result.rejected.concat(result.pending).filter(Boolean)
        if (failed.length) {
          throw new Error(`Email gönderimi başarısız: ${failed.join(", ")}`)
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
    error: "/login/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Sadece belirtilen email adresine izin ver
      if (user.email !== process.env.AUTHORIZED_EMAIL) {
        return false
      }
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub
      }
      return session
    },
  },
}

function html({ url, host }: { url: string; host: string }) {
  const escapedHost = host.replace(/\./g, "&#8203;.")
  const color = {
    background: "#f9fafb",
    text: "#1f2937",
    mainBackground: "#ffffff",
    buttonBackground: "#0284c7",
    buttonBorder: "#0284c7",
    buttonText: "#ffffff",
  }

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <style>
    body { background: ${color.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; }
    .container { max-width: 580px; margin: 40px auto; background: ${color.mainBackground}; border-radius: 8px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; color: ${color.text}; }
    .content p { margin: 0 0 16px; line-height: 1.6; }
    .button { display: inline-block; padding: 14px 32px; background: ${color.buttonBackground}; color: ${color.buttonText}; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { padding: 20px 30px; background: #f3f4f6; text-align: center; color: #6b7280; font-size: 14px; }
    .code-box { background: #f3f4f6; border: 2px solid #e5e7eb; padding: 20px; border-radius: 6px; text-align: center; margin: 20px 0; }
    .code { font-size: 32px; font-weight: 700; color: #0284c7; letter-spacing: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 Ahura Gold ERP</h1>
    </div>
    <div class="content">
      <p>Merhaba,</p>
      <p>Ahura Gold ERP sistemine giriş yapabilmek için aşağıdaki bağlantıya tıklayın:</p>
      <div style="text-align: center;">
        <a href="${url}" class="button">Giriş Yap</a>
      </div>
      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
        Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
      </p>
      <p style="color: #6b7280; font-size: 14px;">
        Link 24 saat boyunca geçerlidir.
      </p>
    </div>
    <div class="footer">
      <p>© 2024 Ahura Gold ERP. Tüm hakları saklıdır.</p>
      <p>${escapedHost}</p>
    </div>
  </div>
</body>
</html>
`
}

function text({ url, host }: { url: string; host: string }) {
  return `Ahura Gold ERP - Giriş\n\n${host} sistemine giriş yapabilmek için aşağıdaki bağlantıya tıklayın:\n\n${url}\n\nEğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.\n\nLink 24 saat boyunca geçerlidir.`
}

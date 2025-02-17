import nodemailer from 'nodemailer'
import { google } from 'googleapis'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.email || !body.message) {
    return {
      status: 400,
      message: 'メールアドレスとお問い合わせ内容は必須です',
    }
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
  )

  oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN })

  const accessToken = await oauth2Client.getAccessToken()
  console.log(accessToken)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: accessToken.token || '',
    },
  })

  try {
    await transporter.sendMail({
      from: `"お問い合わせフォーム" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: 'お問い合わせがありました',
      text: `お名前: ${body.name}\nメールアドレス: ${body.email}\n\nお問い合わせ内容:\n${body.message}`,
    })
    return { status: 200, message: 'お問い合わせを送信しました' }
  } catch (error) {
    console.error('メール送信エラー:', error)
    return { status: 500, message: 'メールの送信に失敗しました' }
  }
})

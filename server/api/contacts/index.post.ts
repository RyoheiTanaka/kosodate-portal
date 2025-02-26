import nodemailer from 'nodemailer'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.email || !body.message) {
    return {
      status: 400,
      message: 'メールアドレスとお問い合わせ内容は必須です',
    }
  }

  const recaptchaToken = body.recaptchaToken

  const recaptchaRes = await $fetch<{ success: boolean, score: number }>(
    'https://www.google.com/recaptcha/api/siteverify',
    {
      method: 'POST',
      body: new URLSearchParams({
        secret: process.env.GOOGLE_RECAPTCHA_SECRET_KEY as string,
        response: recaptchaToken,
      }),
    },
  )

  // スコアが低すぎる場合は拒否
  if (!recaptchaRes.success || recaptchaRes.score < 0.5) {
    throw createError({ statusCode: 400, statusMessage: 'reCAPTCHA認証に失敗しました' })
  }

  const transporter = nodemailer.createTransport({
    host: process.env.GMAIL_SMTP_HOST,
    port: Number(process.env.GMAIL_SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.GMAIL_SMTP_USER,
      pass: process.env.GMAIL_SMTP_PASS,
    },
  })

  try {
    await transporter.sendMail({
      from: `"お問い合わせフォーム" <${process.env.GMAIL_SMTP_USER}>`,
      to: process.env.GMAIL_SMTP_FROM,
      subject: 'お問い合わせがありました',
      text: `お名前: ${body.name}\nメールアドレス: ${body.email}\n\nお問い合わせ内容:\n${body.message}`,
    })
    return { status: 200, message: 'お問い合わせを送信しました' }
  } catch (error) {
    console.error('お問い合わせ送信エラー:', error)
    return { status: 500, message: 'お問い合わせの送信に失敗しました' }
  }
})

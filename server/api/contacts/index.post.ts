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
  if (!recaptchaRes.success || recaptchaRes.score < 0.7) {
    return {
      status: 400,
      message: 'reCAPTCHA認証に失敗しました。スパムの可能性があります。',
    }
  }

  const sanitizeInput = (input: string) => {
    return input.replace(/<[^>]*>/g, '') // HTMLタグを削除
  }

  const safeName = sanitizeInput(body.name)
  const safeEmail = sanitizeInput(body.email)
  const safeMessage = sanitizeInput(body.message)

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
      text: `お名前: ${safeName}\nメールアドレス: ${safeEmail}\n\nお問い合わせ内容:\n${safeMessage}`,
    })
    return { status: 200, message: 'お問い合わせを送信しました' }
  } catch (error) {
    console.error('お問い合わせ送信エラー:', error)
    return { status: 500, message: 'お問い合わせの送信に失敗しました' }
  }
})

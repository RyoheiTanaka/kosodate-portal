export {}

export interface District {
  name: string
  alphabet: string
}

declare global {
  const grecaptcha: {
    execute: (siteKey: string, options: { action: string }) => Promise<string>
  }
}

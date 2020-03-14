import dotenv from 'dotenv'
dotenv.config()

export const prefix = process.env.BOT_PREFIX || '!'
export const botToken = process.env.BOT_TOKEN

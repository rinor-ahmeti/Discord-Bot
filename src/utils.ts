import { Message, User } from 'discord.js'
import emoji from 'node-emoji'

export function toArray<T>(arg: T | T[]): T[] {
  if (typeof arg === 'undefined') {
    return []
  }

  return Array.isArray(arg) ? arg : [arg]
}

export function pickOne<T>(array: T[]): T {
  return array[Math.floor(array.length * Math.random())]
}

const numbers = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine'
]

export async function awaitReaction(
  message: Message,
  author: User,
  reactions: string[],
  time = 30
): Promise<number | undefined> {
  reactions = reactions.map(r => emoji.get(r))

  for (const reaction of reactions) {
    await message.react(reaction)
  }

  const filter = (reaction, user) =>
    reactions.includes(reaction.emoji.name) && user.id === author.id

  const answer = await message
    .awaitReactions(filter, { max: 1, time: time * 1000 })
    .then(collected => collected.first() && collected.first().emoji.name)

  if (answer) {
    return reactions.indexOf(answer)
  } else {
    return undefined
  }
}

export async function poll(
  message: Message,
  options: string[],
  caption?: string,
  time = 30
): Promise<number | undefined> {
  let text = options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')

  if (caption) {
    text = `**${caption}**\n${text}`
  }

  const pollMessage = await message.channel.send(text)
  return await awaitReaction(
    toArray(pollMessage)[0],
    message.author,
    numbers.slice(0, options.length),
    time
  )
}

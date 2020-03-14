import { Command } from '../types'

export const command: Command = {
  name: 'echo',
  run({ args, message }) {
    message.channel.send(JSON.stringify(args))
  }
}

import Discord from 'discord.js'
import minimist from 'minimist'
import stringArgv from 'string-argv'
import commands from './commands'
import { botToken, prefix } from './config'
import * as db from './db'
import { Command, Dictionary, MessageContext } from './types'

commands.forEach(command => {
  if (command.setup) {
    command.setup({
      command: db.commandState(command.name),
      root: db.rootState
    })
  }
})

const commandsAssoc = commands.reduce((acc, command) => {
  const current = [command.name, ...(command.aliases || [])].reduce(
    (acc, id) => ({
      ...acc,
      [id.toLowerCase()]: command
    }),
    {}
  )

  return {
    ...acc,
    ...current
  }
}, {}) as Dictionary<Command>

async function run(command: Command, context: MessageContext): Promise<void> {
  try {
    await command.run(context)
  } catch (e) {
    context.message.channel.send(`Error: ${e.message}`)
  }
}

const client = new Discord.Client()

client.on('message', async message => {
  if (
    message.author.bot ||
    !message.guild ||
    !message.content.startsWith(prefix)
  ) {
    return
  }

  if (!message.member) {
    message.member = await message.guild.fetchMember(message)
  }

  const [id, ...args] = stringArgv(message.content.substr(prefix.length))
  const command = commandsAssoc[id.toLowerCase()]
  if (command) {
    const stateKey = command.stateKey || command.name
    const context: MessageContext = {
      message: message,
      args: minimist(args, command.options),
      rawArgs: args,
      state: {
        user: db.userCommandState(stateKey, message.author.id),
        command: db.commandState(stateKey),
        root: db.rootState,
        userRoot: db.userRootState(message.author.id)
      }
    }

    run(command, context)
  }
})

client.login(botToken)

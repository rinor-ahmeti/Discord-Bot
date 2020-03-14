import { Message } from 'discord.js'
import { Opts, ParsedArgs } from 'minimist'

export type PropertyPath = string | string[]

export type PropertyUpdater<T = any> = (current: T | undefined) => T

export interface State<T> {
  at<TValue = any>(path: PropertyPath): State<TValue>
  get(): T | undefined
  get<TValue = any>(path: PropertyPath): TValue | undefined
  set(val: T): void
  set<TValue = any>(path: PropertyPath, val: TValue): void
  map(fn: PropertyUpdater<T>): void
  map<TValue = any>(path: PropertyPath, fn: PropertyUpdater<TValue>): void
}

export interface Dictionary<TValue = any> {
  [key: string]: TValue
}

export interface MessageContext<TUserState = any, TCommandState = any> {
  message: Message
  args: ParsedArgs,
  rawArgs: string[],
  state: {
    user: State<TUserState>
    command: State<TCommandState>
    root: State<Dictionary>
    userRoot: State<Dictionary>
  }
}

export interface SetupContext<TCommandState = any> {
  command: State<TCommandState>
  root: State<Dictionary>
}

export interface Command<TUserState = any, TCommandState = any> {
  name: string
  stateKey?: string
  aliases?: string[]
  options?: Opts
  setup?(context: SetupContext<TCommandState>): void
  run(context: MessageContext<TUserState, TCommandState>): void | Promise<void>
}

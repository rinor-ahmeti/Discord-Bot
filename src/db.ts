import { throttle } from 'lodash'
import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import { resolve } from 'path'
import { PropertyPath, PropertyUpdater, State as IState } from './types'
import { toArray } from './utils'

const dbPath = resolve(__dirname, '..', 'db.json')
const adapter = new FileSync(dbPath)
const original = adapter.write
const write = throttle(data => original.call(adapter, data), 1000)
adapter.write = write
const db = low(adapter)

db.defaults({
  root: {},
  commands: {}
}).write()

write.flush()

export class State<T = any> implements IState<T> {
  private readonly path: string[]

  constructor(path: PropertyPath) {
    this.path = toArray(path)
  }

  at<TValue = any>(path: PropertyPath): State<TValue> {
    return new State<TValue>([...this.path, ...toArray(path)])
  }

  get(): T | undefined
  get<TValue = any>(path: PropertyPath): TValue | undefined
  get(path?: PropertyPath) {
    return db.get([...this.path, ...toArray(path)]).value()
  }

  set(val: T): void
  set<TValue = any>(path: PropertyPath, val: TValue): void
  set(path: PropertyPath | any, val?: any) {
    if (typeof val === 'undefined') {
      val = path as any
      path = []
    }

    db.set([...this.path, ...toArray(path as PropertyPath)], val).write()
  }

  map(fn: PropertyUpdater<T>): void
  map<TValue = any>(path: PropertyPath, fn: PropertyUpdater<TValue>): void
  map(path: PropertyPath | PropertyUpdater, fn?: PropertyUpdater) {
    if (typeof fn === 'undefined') {
      fn = path as PropertyUpdater
      path = []
    }

    this.set(path as PropertyPath, fn(this.get(path as PropertyPath)))
  }
}

export function commandState<T = any>(stateKey: string) {
  return new State<T>(['commands', stateKey, 'state'])
}

export function userCommandState<T = any>(stateKey: string, userId: string) {
  return new State<T>(['commands', stateKey, 'users', userId])
}

export const rootState = new State(['root', 'state'])

export function userRootState<T = any>(userId: string) {
  return new State<T>(['root', 'users', userId])
}

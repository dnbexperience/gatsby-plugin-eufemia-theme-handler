/**
 * EventEmitter copy from @dnb/eufemia
 *
 * The reason:
 *
 * Because when it is used in the mono-repo https://github.com/dnbexperience/eufemia
 * we some times do build without a prod bundle, so the EventEmitter is then inside /src:
 * import EventEmitter from '@dnb/eufemia/src/shared/helpers/EventEmitter'
 * But when this package is used inside projects, we do not have /src – a workaround could be to export /src in the main package.
 */

declare global {
  interface Window {
    __EEE__?: EventEmitterEEE
  }
}

export type EventEmitterId = string
export type EventEmitterData = Record<string, unknown>
export type EventEmitterListener = (data: EventEmitterData) => void
export type EventEmitterEEE = Record<
  EventEmitterId,
  EventEmitterScopeObject
>
export type EventEmitterScope =
  | ({
      __EEE__?: EventEmitterEEE
    } & Window)
  | EventEmitter
export type EventEmitterScopeInstances = Array<EventEmitter>
export type EventEmitterScopeObject = {
  count: number
  instances: EventEmitterScopeInstances
  data: EventEmitterData
}

class EventEmitter {
  static createInstance(id: EventEmitterId) {
    return new EventEmitter(id)
  }

  static __EEE__?: Record<EventEmitterId, EventEmitterScopeObject>
  id: EventEmitterId
  listeners: Array<EventEmitterListener>

  constructor(id: EventEmitterId) {
    scope.__EEE__ = scope.__EEE__ || {}
    if (!scope.__EEE__[id]) {
      scope.__EEE__[id] = {
        instances: [],
        count: 0,
        data: {},
      }
    }
    scope.__EEE__[id].count = scope.__EEE__[id].count + 1
    scope.__EEE__[id].instances.push(this)

    this.id = id
    this.listeners = []

    return this
  }
  update = (data: EventEmitterData) => {
    this.set(data)
    scope.__EEE__[this.id].instances.forEach((instance) => {
      instance.listeners.forEach((fn) => {
        if (typeof fn === 'function') {
          fn(instance.get())
        }
      })
    })
  }
  set = (data: EventEmitterData) => {
    scope.__EEE__[this.id].data = {
      ...scope.__EEE__[this.id].data,
      ...data,
    }
  }
  get = () => {
    return scope.__EEE__[this.id].data
  }
  listen(fn: EventEmitterListener) {
    if (!this.listeners.includes(fn)) {
      this.listeners.push(fn)
    }
    return this
  }
  unlisten(fn?: EventEmitterListener | undefined) {
    for (let i = 0, l = this.listeners.length; i < l; i++) {
      if (!fn || (fn && fn === this.listeners[i])) {
        this.listeners[i] = null
      }
    }
  }
  remove() {
    this.unlisten()
    scope.__EEE__[this.id].count = scope.__EEE__[this.id].count - 1
    if (scope.__EEE__[this.id].count <= 0) {
      delete scope[this.id]
    }
  }
}

const scope = typeof window !== 'undefined' ? window : EventEmitter

export default EventEmitter

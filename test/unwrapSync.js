/* eslint-disable ava/no-identical-title */
import test from 'ava'

import unwrapSync from '../lib/unwrapSync'

{
  const asIs = (t, value) => {
    t.true(unwrapSync(value) === value)
  }
  asIs.title = (kind, value, note) => `returns ${kind} values ${note ? `(${note}) ` : ''}as-is`

  test('string', asIs, 'foo')
  test('boolean', asIs, true)
  test('number', asIs, 42)
  test('function', asIs, () => {}, 'without .then')
  const fn = () => {}
  fn.then = true
  test('function', asIs, fn, 'without .then being a function')
  test('object', asIs, {}, 'without .then')
  test('object', asIs, { then: true }, 'without .then being a function')
  test('array', asIs, [], 'without .then')
  const arr = []
  arr.then = true
  test('array', asIs, arr, 'without .then being a function')
}

{
  const unwrapRejected = (t, thenable) => {
    const expected = new Error()
    thenable.then = (resolve, reject) => {
      reject(expected)
    }
    const actual = t.throws(() => unwrapSync(thenable))
    t.true(actual === expected)
  }
  unwrapRejected.title = (_, thenable) => `throws reason when unwrapping a rejected thenable ${typeof thenable}`

  const unwrapResolved = (t, thenable) => {
    const expected = Symbol('')
    thenable.then = resolve => {
      resolve(expected)
    }
    const actual = unwrapSync(thenable)
    t.true(actual === expected)
  }
  unwrapResolved.title = (_, thenable) => `returns value when unwrapping a fulfilled thenable ${typeof thenable}`

  const unwrapRecursive = (t, thenable) => {
    const expected = Symbol('')
    const recursive = {
      then (resolve) {
        resolve(expected)
      }
    }
    thenable.then = resolve => {
      resolve(recursive)
    }

    const actual = unwrapSync(thenable)
    t.true(actual === expected)
  }
  unwrapRecursive.title = (_, thenable) => `returns value when unwrapping a fulfilled, recursive thenable ${typeof thenable}`

  const correctlyCallsThen = (t, thenable) => {
    t.plan(1)
    thenable.then = function (resolve) {
      t.true(this === thenable)
      resolve()
    }

    unwrapSync(thenable)
  }
  correctlyCallsThen.title = (_, thenable) => `correctly calls thenable.then() for a thenable ${typeof thenable}`

  const throwsForAsync = (t, thenable) => {
    thenable.then = () => {}
    const err = t.throws(() => unwrapSync(thenable))
    t.is(err.name, 'UnwrapError')
    t.true(err.thenable === thenable)
  }
  throwsForAsync.title = (_, thenable) => `throws if thenable ${typeof thenable} is asynchronous`

  const ignoresRepeats = (t, thenable) => {
    const expected = Symbol('')
    thenable.then = (resolve, reject) => {
      resolve(expected)
      resolve(Symbol(''))
      reject(new Error())
    }

    const actual = unwrapSync(thenable)
    t.true(actual === expected)
  }
  ignoresRepeats.title = (_, thenable) => `ignores repeated .then() callbacks for a thenable ${typeof thenable}`

  for (const thenable of [{}, () => {}]) {
    test([
      unwrapRejected,
      unwrapResolved,
      unwrapRecursive,
      correctlyCallsThen,
      throwsForAsync,
      ignoresRepeats
    ], thenable)
  }
}

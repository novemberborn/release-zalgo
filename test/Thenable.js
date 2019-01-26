/* eslint-disable no-new, promise/catch-or-return, promise/always-return, unicorn/catch-error-name */
import test from 'ava'

import Thenable from '../lib/Thenable'

test('immediately invokes the executor', t => {
  t.plan(1)
  new Thenable(() => t.pass())
})

test('consumes exceptions', async t => {
  await t.notThrowsAsync(new Thenable(() => {})) // eslint-disable-line ava/use-t-well
})

test('unwraps executor return values', t => {
  t.plan(1)
  const expected = Symbol('')
  new Thenable(() => {
    return new Thenable(() => expected)
  }).then(actual => t.true(actual === expected))
})

test('then() invokes onFulfilled callback if fulfilled', t => {
  t.plan(1)
  const expected = Symbol('')
  new Thenable(() => expected)
    .then(actual => t.true(actual === expected))
})

test('then() invokes onRejected callback if rejected', t => {
  t.plan(1)
  const expected = new Error()
  new Thenable(() => { throw expected })
    .then(null, actual => t.true(actual === expected))
})

test('then() returns its thenable if called without callbacks', t => {
  const thenable = new Thenable(() => {})
  t.true(thenable.then() === thenable)
})

test('then() returns its thenable if called with onFulfilled callback, but rejected', t => {
  const thenable = new Thenable(() => { throw new Error() })
  t.true(thenable.then(() => {}) === thenable)
})

test('then() returns its thenable if called with onRejected callback, but fulfilled', t => {
  const thenable = new Thenable(() => {})
  t.true(thenable.then(null, () => {}) === thenable)
})

test('catch() invokes onRejected callback if rejected', t => {
  t.plan(1)
  const expected = new Error()
  new Thenable(() => { throw expected })
    .catch(actual => t.true(actual === expected))
})

test('catch() returns its thenable if called without callbacks', t => {
  const thenable = new Thenable(() => {})
  t.true(thenable.catch() === thenable)
})

test('catch() returns its thenable if called but fulfilled', t => {
  const thenable = new Thenable(() => {})
  t.true(thenable.catch(() => {}) === thenable)
})

test('then() returns new thenable, fulfilled with the result of the onFulfilled callback', t => {
  t.plan(2)
  const expected = Symbol('')

  const thenable = new Thenable(() => {})
  const other = thenable.then(() => expected)
  t.true(other !== thenable)
  other.then(actual => t.true(actual === expected))
})

test('then() returns new thenable, rejected  with the reason if the onFulfilled callback throws', t => {
  t.plan(2)
  const expected = new Error()

  const thenable = new Thenable(() => {})
  const other = thenable.then(() => { throw expected })
  t.true(other !== thenable)
  other.catch(actual => t.true(actual === expected))
})

test('then() returns new thenable, fulfilled with the result of the onRejected callback', t => {
  t.plan(2)
  const expected = Symbol('')

  const thenable = new Thenable(() => { throw new Error() })
  const other = thenable.then(null, () => expected)
  t.true(other !== thenable)
  other.then(actual => t.true(actual === expected))
})

test('then() returns new thenable, rejected  with the reason if the onRejected callback throws', t => {
  t.plan(2)
  const expected = new Error()

  const thenable = new Thenable(() => { throw new Error() })
  const other = thenable.then(null, () => { throw expected })
  t.true(other !== thenable)
  other.catch(actual => t.true(actual === expected))
})

test('catch() returns new thenable, fulfilled with the result of the onRejected callback', t => {
  t.plan(2)
  const expected = Symbol('')

  const thenable = new Thenable(() => { throw new Error() })
  const other = thenable.catch(() => expected)
  t.true(other !== thenable)
  other.then(actual => t.true(actual === expected))
})

test('catch() returns new thenable, rejected  with the reason if the onRejected callback throws', t => {
  t.plan(2)
  const expected = new Error()

  const thenable = new Thenable(() => { throw new Error() })
  const other = thenable.catch(() => { throw expected })
  t.true(other !== thenable)
  other.catch(actual => t.true(actual === expected))
})

test('repeated calls to then() provide the same value to the callbacks', t => {
  {
    const expected = Symbol('')
    const thenable = new Thenable(() => expected)
    thenable.then(actual => {
      t.true(actual === expected)
      throw new Error()
    })
    thenable.then(actual => t.true(actual === expected))
  }

  {
    const expected = new Error()
    const thenable = new Thenable(() => { throw expected })
    thenable.then(null, actual => {
      t.true(actual === expected)
      return Symbol('')
    })
    thenable.then(null, actual => t.true(actual === expected))
  }
})

test('repeated calls to catch() provide the same value to the callbacks', t => {
  const expected = new Error()
  const thenable = new Thenable(() => { throw expected })
  thenable.catch(actual => {
    t.true(actual === expected)
    return Symbol('')
  })
  thenable.catch(actual => t.true(actual === expected))
})

import test from 'ava'

import releaseZalgo from '../'
import Thenable from '../lib/Thenable'
import unwrapSync from '../lib/unwrapSync'

test.beforeEach(t => {
  t.context.zalgo = releaseZalgo.sync()
})

test('run() runs the sync executor', t => {
  const { zalgo } = t.context
  t.plan(1)

  zalgo.run({
    sync () {
      t.pass()
    }
  })
})

test('run() returns a thenable', t => {
  const { zalgo } = t.context
  t.true(zalgo.run({ sync () {} }) instanceof Thenable)
})

test('run() forwards arguments to the executor', t => {
  const { zalgo } = t.context
  t.plan(1)

  const expected = [Symbol(''), Symbol('')]
  zalgo.run({
    sync (...actual) {
      t.deepEqual(actual, expected)
    }
  }, ...expected)
})

test('run()’s thenable is fulfilled with the executor’s return value', t => {
  const { zalgo } = t.context

  const expected = Symbol('')
  const actual = unwrapSync(zalgo.run({
    sync () {
      return expected
    }
  }))

  t.true(actual === expected)
})

test('run()’s thenable is rejected with the error if the executor throws', t => {
  const { zalgo } = t.context

  const expected = new Error()
  const thenable = zalgo.run({
    sync () {
      throw expected
    }
  })

  t.true(thenable instanceof Thenable)
  const actual = t.throws(() => unwrapSync(thenable))
  t.true(actual === expected)
})

test('run()’s thenable is rejected if the executor returns a promise', t => {
  const { zalgo } = t.context

  const promise = Promise.resolve()
  const thenable = zalgo.run({
    sync () {
      return promise
    }
  })

  t.true(thenable instanceof Thenable)
  const err = t.throws(() => unwrapSync(thenable))
  t.is(err.name, 'UnwrapError')
  t.true(err.thenable === promise)
})

test('all() returns a thenable that is fulfilled when all inputs are', t => {
  const { zalgo } = t.context

  const expected = [Symbol(''), Symbol('')]
  const thenable = zalgo.all([expected[0], new Thenable(() => expected[1])])

  t.true(thenable instanceof Thenable)
  const actual = unwrapSync(thenable)
  t.deepEqual(actual, expected)
})

test('all() returns a thenable that is rejected with the same reason as the first rejecting input', t => {
  const { zalgo } = t.context

  const expected = new Error()
  const thenable = zalgo.all([Symbol(''), new Thenable(() => Symbol('')), new Thenable(() => { throw expected })])

  t.true(thenable instanceof Thenable)
  const actual = t.throws(() => unwrapSync(thenable))
  t.true(actual === expected)
})

test('all() returns a thenable that is rejected if an input is a promise', t => {
  const { zalgo } = t.context

  const promise = Promise.resolve()
  const thenable = zalgo.all([promise])

  t.true(thenable instanceof Thenable)
  const err = t.throws(() => unwrapSync(thenable))
  t.is(err.name, 'UnwrapError')
  t.true(err.thenable === promise)
})

test('returns() returns a thenable that is fulfilled with the value', t => {
  const { zalgo } = t.context

  const expected = Symbol('')
  const thenable = zalgo.returns(expected)

  t.true(thenable instanceof Thenable)
  const actual = unwrapSync(thenable)
  t.true(actual === expected)
})

test('returns() returns a thenable that is rejected if the value is a promise', t => {
  const { zalgo } = t.context

  const promise = Promise.resolve()
  const thenable = zalgo.returns(promise)

  const err = t.throws(() => unwrapSync(thenable))
  t.is(err.name, 'UnwrapError')
  t.true(err.thenable === promise)
})

test('throws() returns a thenable that is rejected with the value', t => {
  const { zalgo } = t.context

  const expected = new Error()
  const thenable = zalgo.throws(expected)

  t.true(thenable instanceof Thenable)
  const actual = t.throws(() => unwrapSync(thenable))
  t.true(actual === expected)
})

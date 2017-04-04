import test from 'ava'

import releaseZalgo from '../'

test.beforeEach(t => {
  t.context.zalgo = releaseZalgo.async()
})

test('run() runs the async executor', t => {
  const { zalgo } = t.context
  t.plan(1)

  zalgo.run({
    async () {
      t.pass()
    }
  })
})

test('run() returns a promise', t => {
  const { zalgo } = t.context
  t.true(zalgo.run({ async () {} }) instanceof Promise)
})

test('run() forwards arguments to the executor', t => {
  const { zalgo } = t.context
  t.plan(1)

  const expected = [Symbol(''), Symbol('')]
  zalgo.run({
    async (...actual) {
      t.deepEqual(actual, expected)
    }
  }, ...expected)
})

test('run()’s promise is fulfilled with the executor’s return value', async t => {
  const { zalgo } = t.context

  const expected = Symbol('')
  const actual = await zalgo.run({
    async () {
      return expected
    }
  })

  t.true(actual === expected)
})

test('run()’s promise is rejected with the error if the executor throws', async t => {
  const { zalgo } = t.context

  const expected = new Error()
  const promise = zalgo.run({
    async () {
      throw expected
    }
  })

  t.true(promise instanceof Promise)
  const actual = await t.throws(promise)
  t.true(actual === expected)
})

test('all() returns a promise that is fulfilled when all inputs are', async t => {
  const { zalgo } = t.context

  const expected = [Symbol(''), Symbol('')]
  const promise = zalgo.all([expected[0], Promise.resolve(expected[1])])

  t.true(promise instanceof Promise)
  const actual = await promise
  t.deepEqual(actual, expected)
})

test('all() returns a promise that is rejected with the same reason as the first rejecting input', async t => {
  const { zalgo } = t.context

  const expected = new Error()
  const promise = zalgo.all([Symbol(''), Promise.resolve(Symbol('')), Promise.reject(expected)])

  t.true(promise instanceof Promise)
  const actual = await t.throws(promise)
  t.true(actual === expected)
})

test('returns() returns a promise that is fulfilled with the value', async t => {
  const { zalgo } = t.context

  const expected = Symbol('')
  const promise = zalgo.returns(expected)

  t.true(promise instanceof Promise)
  const actual = await promise
  t.true(actual === expected)
})

test('throws() returns a promise that is rejected with the value', async t => {
  const { zalgo } = t.context

  const expected = new Error()
  const promise = zalgo.throws(expected)

  t.true(promise instanceof Promise)
  const actual = await t.throws(promise)
  t.true(actual === expected)
})

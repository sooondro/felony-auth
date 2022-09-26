import { RedisAdapter } from "../../../src/cache/redis/RedisAdapter"
import {AuthenticationError} from "../../../src/error/AuthenticationError"

import AuthenticableUser from "../../../src/types/AuthenticableUser"
import RedisConnectionData from "../../../src/types/RedisConnectionData"

describe("RedisAdapter", () => {
  let redisAdapter: RedisAdapter
  const connectionString = "redis://localhost:6379"

  describe("setupConnectionWithConnectionString", () => {
    beforeEach(() => {
      redisAdapter = new RedisAdapter()
      jest.spyOn(redisAdapter, "setupConnectionWithConnectionString")
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it("should throw when invalid url is provided", async () => {
      try {
        await redisAdapter.setupConnectionWithConnectionString("foobar")
      } catch (error) {
        expect(redisAdapter.setupConnectionWithConnectionString).toHaveBeenCalledTimes(1)
        expect(redisAdapter["client"]).toBeUndefined()
        if (error instanceof Error) {
          expect(error.message).toEqual("Invalid URL")
        }
      }
    })

    it("should connect when a valid connection url is provided", async () => {
      await redisAdapter.setupConnectionWithConnectionString(connectionString)

      expect(redisAdapter.setupConnectionWithConnectionString).toHaveBeenCalledTimes(1)
      expect(redisAdapter["client"]).toBeDefined()
      redisAdapter["client"].quit()
    })
  })

  describe("setupConnectionWithConnectionData", () => {
    beforeEach(() => {
      redisAdapter = new RedisAdapter()
      jest.spyOn(redisAdapter, "setupConnectionWithConnectionData")
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it("should throw when invalid connection data is provided", async () => {
      const config: RedisConnectionData = {
        socket: {
          host: "foobar",
          port: 1234
        }
      }

      try {
        await redisAdapter.setupConnectionWithConnectionData(config)
      } catch (error) {
        expect(redisAdapter.setupConnectionWithConnectionData).toHaveBeenCalledTimes(1)
        if (error instanceof Error) {
          expect(error.message).toEqual("getaddrinfo")
        }
      }
    })

    it("should connect when valid connection data is provided", async () => {
      const config: RedisConnectionData = {
        socket: {
          host: "localhost",
          port: 6379
        }
      }

      await redisAdapter.setupConnectionWithConnectionData(config)

      expect(redisAdapter.setupConnectionWithConnectionData).toHaveBeenCalledTimes(1)
      expect(redisAdapter["client"]).toBeDefined()
      redisAdapter["client"].quit()
    })
  })

  describe("createSession", () => {
    beforeEach(async () => {
      redisAdapter = new RedisAdapter()
      await redisAdapter.setupConnectionWithConnectionString(connectionString)
      jest.spyOn(redisAdapter, "createSession")
    })

    afterEach(async () => {
      jest.resetAllMocks()
      await redisAdapter['client'].flushAll()
      redisAdapter["client"].quit()
    })

    it("should return a session id when valid data is provided", async () => {
      const user: AuthenticableUser = {
        id: "1b0049e0-2155-4db4-a8f6-90006397fb1c",
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com"
      }

      const result = await redisAdapter.createSession(user)

      expect(redisAdapter.createSession).toHaveBeenCalledTimes(1)
      expect(result).toBeDefined()
    })
  })

  describe("getSession", () => {
    beforeEach(async () => {
      redisAdapter = new RedisAdapter()
      await redisAdapter.setupConnectionWithConnectionString(connectionString)
      jest.spyOn(redisAdapter, "getSession")
    })

    afterEach(async () => {
      jest.resetAllMocks()
      await redisAdapter['client'].flushAll()
      redisAdapter["client"].quit()
    })

    it("should throw when a nonexistent session id is provided", async () => {
      try {
        await redisAdapter.getSession("foo")
      } catch (error) {
        expect(redisAdapter.getSession).toHaveBeenCalledTimes(1)
        expect(error).toBeInstanceOf(AuthenticationError)
        if (error instanceof AuthenticationError) {
          expect(error.message).toEqual('invalid credentials')
        }
      }
    })

    it("should return a Session object when a valid id is provided", async () => {
      const user: AuthenticableUser = {
        id: "1b0049e0-2155-4db4-a8f6-90006397fb1c",
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com"
      }

      const sessionId = await redisAdapter.createSession(user)

      const result = await redisAdapter.getSession(sessionId)

      expect(redisAdapter.getSession).toHaveBeenCalledTimes(1)
      expect(result.id).toBeDefined()
      expect(result.user).toEqual(user)
    })
  })

  describe("logout", () => {
    beforeEach(async () => {
      redisAdapter = new RedisAdapter()
      await redisAdapter.setupConnectionWithConnectionString(connectionString)
      jest.spyOn(redisAdapter, "getSession")
      jest.spyOn(redisAdapter, "logout")
    })

    afterEach(async () => {
      jest.resetAllMocks()
      await redisAdapter['client'].flushAll()
      redisAdapter["client"].quit()
    })

    it("should do nothing if invalid session id is provided", async () => {
      await redisAdapter.logout("foo")

      expect(redisAdapter.logout).toHaveBeenCalledTimes(1)
    })

    it("should remove session from redis when valid session id is provided", async () => {
      await redisAdapter.logout("1b0049e0-2155-4db4-a8f6-90006397fb1c")

      try {
        await redisAdapter.getSession("1b0049e0-2155-4db4-a8f6-90006397fb1c")
      } catch (error) {
        expect(redisAdapter.getSession).toHaveBeenCalledTimes(1)
        expect(redisAdapter.logout).toHaveBeenCalledTimes(1)
        expect(error).toBeInstanceOf(AuthenticationError)
        if (error instanceof AuthenticationError) {
          expect(error.message).toEqual('invalid credentials')
        }
      }
    })
  })

  describe("validateCSRF", () => {
    beforeEach(async () => {
      redisAdapter = new RedisAdapter()
      await redisAdapter.setupConnectionWithConnectionString(connectionString)
      jest.spyOn(redisAdapter, "validateCSRF")

    })

    afterEach(async () => {
      jest.resetAllMocks()
      await redisAdapter['client'].flushAll()
      redisAdapter["client"].quit()
    })

    it("should throw when invalid CSRF token is provided", async () => {
      const user: AuthenticableUser = {
        id: "1b0049e0-2155-4db4-a8f6-90006397fb1c",
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com"
      }

      const sessionId = await redisAdapter.createSession(user)

      try {
        await redisAdapter.validateCSRF(sessionId, "foo")
      } catch (error) {
        expect(redisAdapter.validateCSRF).toHaveBeenCalledTimes(1)
        expect(error).toBeInstanceOf(AuthenticationError)
        if (error instanceof AuthenticationError) {
          expect(error.message).toEqual('invalid credentials')
        }
      }
    })

    it("should do nothing when a valid CSRF token is provided", async () => {
      const user: AuthenticableUser = {
        id: "1b0049e0-2155-4db4-a8f6-90006397fb1c",
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com"
      }

      const sessionId = await redisAdapter.createSession(user)
      const session = await redisAdapter.getSession(sessionId)
      await redisAdapter.validateCSRF(session.id, session.csrf)
      await redisAdapter.createSession(user)

      expect(redisAdapter.validateCSRF).toHaveBeenCalledTimes(1)
    })
  })
})
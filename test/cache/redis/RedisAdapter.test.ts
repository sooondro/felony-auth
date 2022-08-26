import RedisAdapter from "../../../src/cache/redis/RedisAdapter";
import PostgresAdapter from "../../../src/storage/postgres/PostgresAdapter";
import AuthenticableUser from "../../../src/types/AuthenticableUser";

describe("RedisAdapter", () => {
  describe("createConnection", () => {
    let redisAdapter: RedisAdapter;
    const connectionString = "redis://localhost:6379";

    beforeEach(() => {
      redisAdapter = new RedisAdapter();
      jest.spyOn(redisAdapter, "createConnection");
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("should throw when invalid url is provided", async () => {
      try {
        await redisAdapter.createConnection("foobar");
      } catch (error) {
        expect(redisAdapter.createConnection).toHaveBeenCalledTimes(1);
        expect(redisAdapter["client"]).toBeUndefined();
        if (error instanceof Error) {
          expect(error.message).toEqual("Invalid URL");
        }
      }
    });

    it("should connect when a valid connection url is provided", async () => {
      await redisAdapter.createConnection(connectionString);

      expect(redisAdapter.createConnection).toHaveBeenCalledTimes(1);
      expect(redisAdapter["client"]).toBeDefined();
      redisAdapter["client"].quit();
    });
  });

  describe("createSession", () => {
    let redisAdapter: RedisAdapter;
    const connectionString = "redis://localhost:6379";


    beforeEach(async () => {
      redisAdapter = new RedisAdapter();
      await redisAdapter.createConnection(connectionString);
      jest.spyOn(redisAdapter, "createSession");
    });

    afterEach(() => {
      jest.resetAllMocks();
      redisAdapter["client"].quit();
    });

    // it("should throw when invalid data is provided", async () => {
    //   const user: AuthenticableUser = {
    //     id: "",
    //     username: "",
    //     firstName: "",
    //     lastName: "",
    //     email: ""
    //   };

    //   try {
    //     await redisAdapter.createSession(user);
    //   } catch (error) {
    //     console.log(error);
    //     expect(redisAdapter.createSession).toHaveBeenCalledTimes(1);

    //   }
    // });

    it("should return a session id when valid data is provided", async () => {
      const user: AuthenticableUser = {
        id: "1b0049e0-2155-4db4-a8f6-90006397fb1c",
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com"
      };

      const result = await redisAdapter.createSession(user);

      expect(redisAdapter.createSession).toHaveBeenCalledTimes(1);
      expect(result).toEqual("1b0049e0-2155-4db4-a8f6-90006397fb1c");
    });
  });

  describe("getSession", () => {
    let redisAdapter: RedisAdapter;
    const connectionString = "redis://localhost:6379";


    beforeEach(async () => {
      redisAdapter = new RedisAdapter();
      await redisAdapter.createConnection(connectionString);
      jest.spyOn(redisAdapter, "getSession");
    });

    afterEach(() => {
      jest.resetAllMocks();
      redisAdapter["client"].quit();
    });

    it("should throw when a nonexistent session id is provided", async () => {
      try {
        await redisAdapter.getSession("foo");
      } catch (error) {
        expect(redisAdapter.getSession).toHaveBeenCalledTimes(1);
        expect(error).toEqual("Session not found");
      }
    });

    it("should return a Session object when a valid id is provided", async () => {
      const user: AuthenticableUser = {
        id: "1b0049e0-2155-4db4-a8f6-90006397fb1c",
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com"
      };

      const result = await redisAdapter.getSession("1b0049e0-2155-4db4-a8f6-90006397fb1c");

      expect(redisAdapter.getSession).toHaveBeenCalledTimes(1);
      expect(result.id).toEqual("1b0049e0-2155-4db4-a8f6-90006397fb1c");
      expect(result.user).toEqual(user);
    });
  });

  describe("logout", () => {
    let redisAdapter: RedisAdapter;
    const connectionString = "redis://localhost:6379";


    beforeEach(async () => {
      redisAdapter = new RedisAdapter();
      await redisAdapter.createConnection(connectionString);
      jest.spyOn(redisAdapter, "getSession");
      jest.spyOn(redisAdapter, "logout");
    });

    afterEach(() => {
      jest.resetAllMocks();
      redisAdapter["client"].quit();
    });

    it("should do nothing if invalid session id is provided", async () => {
      await redisAdapter.logout("foo");

      expect(redisAdapter.logout).toHaveBeenCalledTimes(1);
    });

    it("should remove session from redis when valid session id is provided", async () => {
      await redisAdapter.logout("1b0049e0-2155-4db4-a8f6-90006397fb1c");

      try {
        await redisAdapter.getSession("1b0049e0-2155-4db4-a8f6-90006397fb1c");
      } catch (error) {
        expect(redisAdapter.getSession).toHaveBeenCalledTimes(1);
        expect(redisAdapter.logout).toHaveBeenCalledTimes(1);
        expect(error).toEqual("Session not found");
      }
    });
  });

  describe("validateCSRF", () => {
    let redisAdapter: RedisAdapter;
    const connectionString = "redis://localhost:6379";


    beforeEach(async () => {
      redisAdapter = new RedisAdapter();
      await redisAdapter.createConnection(connectionString);
      jest.spyOn(redisAdapter, "validateCSRF");
      
    });

    afterEach(() => {
      jest.resetAllMocks();
      redisAdapter["client"].quit();
    });

    it("should throw when invalid CSRF token is provided", async () => {
      const user: AuthenticableUser = {
        id: "1b0049e0-2155-4db4-a8f6-90006397fb1c",
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com"
      };

      await redisAdapter.createSession(user);

      try {
        await redisAdapter.validateCSRF(user.id, "foo");
      } catch (error) {
        expect(redisAdapter.validateCSRF).toHaveBeenCalledTimes(1);
        expect(error).toEqual("Invalid CSRF token");
      }
    });

    it("should do nothing when a valid CSRF token is provided", async () => {
      const user: AuthenticableUser = {
        id: "1b0049e0-2155-4db4-a8f6-90006397fb1c",
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com"
      };

      await redisAdapter.createSession(user);
      const session = await redisAdapter.getSession(user.id);
      await redisAdapter.validateCSRF(session.id, session.csrf);
      await redisAdapter.createSession(user);

      expect(redisAdapter.validateCSRF).toHaveBeenCalledTimes(1);
    });
  });
});
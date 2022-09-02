import { RedisSession } from "../../../src/cache/redis/RedisSession";

import AuthenticableUser from "../../../src/types/AuthenticableUser";

describe("RedisSession", () => {
  describe("constructor", () => {
    it("should create a new RedisSession instance when valid data is provided", () => {
      const user: AuthenticableUser = {
        id: "1b0049e0-2155-4db4-a8f6-90006397fb1c",
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com"
      };

      const redisSession = new RedisSession(user);

      expect(redisSession).toBeDefined();
      expect(redisSession['id']).toBeDefined();
      expect(redisSession['csrf']).toBeDefined();
      expect(redisSession['user']).toBeDefined();
      expect(redisSession['user']).toEqual(user);
    });
  });

  describe("getters", () => {
    it("should retrieve the right parameters", () => {
      const user: AuthenticableUser = {
        id: "1b0049e0-2155-4db4-a8f6-90006397fb1c",
        username: "FooBar",
        firstName: "Foo",
        lastName: "Bar",
        email: "foo@bar.com"
      };
  
      const redisSession = new RedisSession(user);
  
      expect(redisSession).toBeDefined();
      expect(redisSession.Csrf).toBeDefined();
      expect(redisSession.Id).toBeDefined();
      expect(redisSession.User).toEqual(user);
    })
  });
});
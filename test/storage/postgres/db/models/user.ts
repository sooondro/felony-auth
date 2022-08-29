import { Sequelize, ValidationError } from "sequelize";
import PostgresAdapter from "../../../../../src/storage/postgres/PostgresAdapter";

describe("user", () => {
  const postgresAdapter = new PostgresAdapter();

  beforeEach(async () => {
    await postgresAdapter
      .setupPostgresConnectionWithConnectionUri("postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test");
    await postgresAdapter.models.TwoFactorUser.destroy({ where: {} });
    await postgresAdapter.models.User.destroy({ where: {} });
  });

  it("should throw notNull errors when no data is provided", async () => {
    try {
      const user = postgresAdapter.models.User.create();
    } catch (error) {
      console.log(error);
      
      expect(error).toBeInstanceOf(ValidationError);
    }
  });

  it("should throw errors when empty strings are provided", async () => {
    try {
      const user = postgresAdapter.models.User.create({
        username: "FooBar",
        firstName: "",
        lastName: "",
        email: "foobar",
        password: "foo"
      });
    } catch (error) {      
      expect(error).toBeInstanceOf(ValidationError);
    }
  });
});
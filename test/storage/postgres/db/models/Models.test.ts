import PostgresAdapter from "../../../../../src/storage/postgres/PostgresAdapter";
import Models from "../../../../../src/storage/postgres/db/models/Models";
import { DataTypes } from "sequelize";

describe("Models", () => {
  // it("should throw when invalid data is provided", () => {
  //   const postgresAdapter = new PostgresAdapter();
  //   postgresAdapter.setupPostgresConnectionWithConnectionUri("postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test");

  //   expect(new Models("foo", "bar")).toThrow();
  // });

  it("should instantiate User and TwoFactorUser properties when valid data is provided", () => {
    const postgresAdapter = new PostgresAdapter();
    postgresAdapter.setupPostgresConnectionWithConnectionUri("postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test");

    const models = new Models(postgresAdapter["client"], DataTypes);

    expect(models.TwoFactorUser).toBeDefined();
    expect(models.User).toBeDefined();
  });
});
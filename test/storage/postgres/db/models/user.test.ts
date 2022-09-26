import mockdate from 'mockdate'

import { PostgresAdapter } from "../../../../../src/storage/postgres/PostgresAdapter"
import { ValidationError } from "sequelize"

describe("user", () => {
  const postgresAdapter = new PostgresAdapter()

  beforeEach(async () => {
    await postgresAdapter
      .setupConnectionWithConnectionString("postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test")
    await postgresAdapter.models.TwoFactorUser.destroy({ where: {} })
    await postgresAdapter.models.User.destroy({ where: {} })
  })

  it("should throw errors when no data is provided", async () => {
    // used to ensure consistency of snapshots between test runs
    mockdate.set(0)

    try {
      await postgresAdapter.models.User.create({
        id: "foo"
      })
    } catch (error) {
      if (error instanceof ValidationError) {
        expect(error.errors).toMatchSnapshot()
      }

      mockdate.reset()
    }
  })

  it("should throw errors when empty strings are provided", async () => {
    // used to ensure consistency of snapshots between test runs
    mockdate.set(0)
    try {
      await postgresAdapter.models.User.create({
        id: "",
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      })
    } catch (error) {
      if (error instanceof ValidationError) {
        expect(error.errors).toMatchSnapshot()
      }

      mockdate.reset()
    }
  })
})
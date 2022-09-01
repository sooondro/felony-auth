import { UniqueConstraintError, ValidationError } from 'sequelize'
import PostgresAdapter from '../../../src/storage/postgres/PostgresAdapter'
import { ValidationErrors } from '../../../src/error/ValidationError'
import LoginData from '../../../src/types/LoginData'
import TwoFactorRegistrationData from '../../../src/types/TwoFactorRegistrationData'
import RegistrationData from '../../../src/types/RegistrationData'
import AuthenticableUser from '../../../src/types/AuthenticableUser'
import PostgresConnectionData from '../../../src/types/PostgresConnectionData'
import AuthenticationError from '../../../src/error/AuthenticationError'

describe('PostgresAdapter', () => {
  let postgresAdapter: PostgresAdapter

  describe('setupConnectionWithConnectionData', () => {
    it('should instantiate the client when valid connection data is passed', async () => {
      const postgresAdapter = new PostgresAdapter()
      const config: PostgresConnectionData = {
        database: 'felony_auth_test',
        username: 'postgres',
        password: 'postgrespw',
        host: '127.0.0.1',
        dialect: 'postgres',
        port: 5432
      }

      jest.spyOn(postgresAdapter, 'setupConnectionWithConnectionData')

      await postgresAdapter.setupConnectionWithConnectionData(config)

      expect(postgresAdapter.setupConnectionWithConnectionData).toHaveBeenCalledTimes(1)
      expect(postgresAdapter['client']).toBeDefined()
      expect(postgresAdapter['client']['config'].database).toEqual('felony_auth_test')
      expect(postgresAdapter['client']['config'].username).toEqual('postgres')
      expect(postgresAdapter['client']['config'].password).toEqual('postgrespw')
      expect(postgresAdapter['client']['config'].host).toEqual('127.0.0.1')
      expect(postgresAdapter['client']['config'].port).toEqual(5432)
      expect(postgresAdapter['models']).toBeDefined()
    })
  })

  describe('setupConnectionWithConnectionUrl', () => {
    it('should instantiate the client when valid connection uri is passed', async () => {
      const postgresAdapter = new PostgresAdapter()
      const connectioUri = 'postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test'

      jest.spyOn(postgresAdapter, 'setupConnectionWithConnectionUrl')

      await postgresAdapter.setupConnectionWithConnectionUrl(connectioUri)

      expect(postgresAdapter.setupConnectionWithConnectionUrl).toHaveBeenCalledTimes(1)
      expect(postgresAdapter['client']).toBeDefined()
      expect(postgresAdapter['client']['config'].database).toEqual('felony_auth_test')
      expect(postgresAdapter['client']['config'].username).toEqual('postgres')
      expect(postgresAdapter['client']['config'].password).toEqual('postgrespw')
      expect(postgresAdapter['client']['config'].host).toEqual('127.0.0.1')
      expect(postgresAdapter['client']['config'].port).toEqual('5432')
      expect(postgresAdapter['models']).toBeDefined()
    })
  })

  describe('register', () => {
    beforeEach(async () => {
      postgresAdapter = new PostgresAdapter()
      await postgresAdapter.setupConnectionWithConnectionUrl('postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test')
      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} })
      await postgresAdapter.models.User.destroy({ where: {} })
      jest.spyOn(postgresAdapter, 'register')
    })

    afterEach(async () => {
      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} })
      await postgresAdapter.models.User.destroy({ where: {} })
      jest.resetAllMocks()
    })

    it('should throw when a user with the same email already exists in the database', async () => {
      const payload1: RegistrationData = {
        username: 'FooBar',
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo@bar.com',
        password: 'foobar'
      }
      const payload2: RegistrationData = {
        username: 'FooBaz',
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo@bar.com',
        password: 'foobar'
      }

      await postgresAdapter.register(payload1)

      try {
        await postgresAdapter.register(payload2)
        fail()
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationErrors)
        expect(postgresAdapter.register).toHaveBeenCalledTimes(2)
        if (error instanceof ValidationErrors) {
          expect(error.message).toEqual('ValidationError')
          expect(error.statusCode).toEqual(422)
          expect(error.hasErrors()).toBeTruthy()
          expect(error.errors.has('email'))
          expect(error.errors.get('email')?.isEmpty()).toBeFalsy()
          expect(error.errors.get('email')?.errors.includes('invalid credentials')).toBeTruthy()
        }
      }
    })

    it('should throw when a user with the same username already exists in the database', async () => {
      const payload1: RegistrationData = {
        username: 'FooBar',
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo@bar.com',
        password: 'foobar'
      }
      const payload2: RegistrationData = {
        username: 'FooBar',
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo@baz.com',
        password: 'foobar'
      }

      const user = await postgresAdapter.register(payload1)

      try {
        await postgresAdapter.register(payload2)
      } catch (error) {
        expect(user).toBeDefined()
        expect(error).toBeInstanceOf(UniqueConstraintError)
        expect(postgresAdapter.register).toHaveBeenCalledTimes(2)
      }
    })

    it('should throw an error when invalid registration data is provided', async () => {
      const payload: RegistrationData = {
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      }

      try {
        await postgresAdapter.register(payload)
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        expect(postgresAdapter.register).toHaveBeenCalledTimes(1)
      }
    })

    it('should throw an error when invalid email is provided', async () => {
      const payload: RegistrationData = {
        username: 'FooBar',
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo',
        password: 'foobar'
      }

      try {
        await postgresAdapter.register(payload)
      } catch (error) {
        expect(postgresAdapter.register).toHaveBeenCalledTimes(1)
      }
    })

    it('should return an AuthenticableUser object when valid registration data is provided', async () => {
      const payload: RegistrationData = {
        username: 'FooBar',
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo@bar.com',
        password: 'foobar'
      }

      const user = await postgresAdapter.register(payload)

      expect(postgresAdapter.register).toHaveBeenCalledTimes(1)
      expect(user).toBeDefined()
      expect(user.username).toEqual('FooBar')
      expect(user.firstName).toEqual('Foo')
      expect(user.lastName).toEqual('Bar')
      expect(user.email).toEqual('foo@bar.com')
    })
  })

  describe('login', () => {
    beforeEach(async () => {
      postgresAdapter = new PostgresAdapter()
      await postgresAdapter.setupConnectionWithConnectionUrl('postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test')
      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} })
      await postgresAdapter.models.User.destroy({ where: {} })
      jest.spyOn(postgresAdapter, 'login')
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should throw ValidationErrors when invalid payload is provided', async () => {
      const payload: LoginData = {
        email: '',
        password: ''
      }

      try {
        await postgresAdapter.login(payload)
      } catch (error) {
        expect(postgresAdapter.login).toHaveBeenCalledTimes(1)
        expect(error).toBeInstanceOf(ValidationErrors)
      }
    })

    it('should throw when nonexistent email is provided', async () => {
      const loginData: LoginData = {
        email: 'foo@baz.com',
        password: 'foobar'
      }

      try {
        await postgresAdapter.login(loginData)
      } catch (error) {
        if (error instanceof ValidationErrors) {
          expect(error.hasErrors).toBeTruthy()
          expect(error.errors.get('email')).toBeDefined()
          expect(error.errors.get('email')?.isEmpty()).toBeFalsy()
          expect(error.errors.get('email')?.errors).toContain('invalid credentials')
          expect(error.errors.get('email')?.name).toEqual('email')
        }
        expect(postgresAdapter.login).toHaveBeenCalledTimes(1)
        expect(error).toBeInstanceOf(ValidationErrors)
      }
    })

    it('should throw when invalid password is provided', async () => {
      const registrationData: RegistrationData = {
        username: 'FooBar',
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo@bar.com',
        password: 'foobar'
      }

      const loginData: LoginData = {
        email: 'foo@bar.com',
        password: 'invalid'
      }

      jest.spyOn(postgresAdapter, 'register')

      await postgresAdapter.register(registrationData)

      try {
        await postgresAdapter.login(loginData)
      } catch (error) {
        expect(postgresAdapter.register).toHaveBeenCalledTimes(1)
        expect(postgresAdapter.login).toHaveBeenCalledTimes(1)
        expect(error).toBeInstanceOf(AuthenticationError)
        if (error instanceof AuthenticationError) {
          expect(error.message).toEqual('invalid credentials')
        }
      }
    })

    it('should return AuthenticableUser object when valid data is provided', async () => {
      const registrationData: RegistrationData = {
        username: 'FooBar',
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo@bar.com',
        password: 'foobar'
      }

      const loginData: LoginData = {
        email: 'foo@bar.com',
        password: 'foobar'
      }

      jest.spyOn(postgresAdapter, 'register')

      await postgresAdapter.register(registrationData)
      const { user, twoFactorUser } = await postgresAdapter.login(loginData)

      expect(postgresAdapter.register).toHaveBeenCalledTimes(1)
      expect(postgresAdapter.login).toHaveBeenCalledTimes(1)
      expect(user.email).toEqual('foo@bar.com')
      expect(user.firstName).toEqual('Foo')
      expect(user.lastName).toEqual('Bar')
      expect(user.username).toEqual('FooBar')
    })
  })

  describe('getUserByEmail', () => {
    beforeEach(async () => {
      postgresAdapter = new PostgresAdapter()
      await postgresAdapter.setupConnectionWithConnectionUrl('postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test')
      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} })
      await postgresAdapter.models.User.destroy({ where: {} })
      jest.spyOn(postgresAdapter, 'getUserByEmail')
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should throw ValidationErrors when nonexistent email is provided', async () => {
      try {
        await postgresAdapter.getUserByEmail('foo@bar.com')
        fail()
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationErrors)
        expect(postgresAdapter.getUserByEmail).toHaveBeenCalledTimes(1)
      }
    })

    it('should throw ValidationErrors when invalid email is provided', async () => {
      try {
        await postgresAdapter.getUserByEmail('foobar')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationErrors)
        expect(postgresAdapter.getUserByEmail).toHaveBeenCalledTimes(1)
      }
    })

    it('should return AuthenticableUser when existent email is provided', async () => {
      const registrationData: RegistrationData = {
        username: 'FooBar',
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo@bar.com',
        password: 'foobar'
      }

      await postgresAdapter.register(registrationData)

      const user = await postgresAdapter.getUserByEmail('foo@bar.com')

      expect(user.email).toEqual('foo@bar.com')
      expect(user.username).toEqual('FooBar')
      expect(user.firstName).toEqual('Foo')
      expect(user.lastName).toEqual('Bar')
      expect(postgresAdapter.getUserByEmail).toHaveBeenCalledTimes(1)
    })
  })

  describe('getUserById', () => {
    beforeEach(async () => {
      postgresAdapter = new PostgresAdapter()
      await postgresAdapter.setupConnectionWithConnectionUrl('postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test')
      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} })
      await postgresAdapter.models.User.destroy({ where: {} })
      jest.spyOn(postgresAdapter, 'getUserById')
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should throw ValidationErrors when nonexistent id is provided', async () => {
      try {
        await postgresAdapter.getUserById('ace278b0-4a75-4803-bc1b-77b41251f7d3')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationErrors)
        expect(postgresAdapter.getUserById).toHaveBeenCalledTimes(1)
      }
    })

    it('should throw when invalid id is provided', async () => {
      try {
        await postgresAdapter.getUserById('foo')
      } catch (error) {
        expect(postgresAdapter.getUserById).toHaveBeenCalledTimes(1)
        if (error instanceof Error) {
          expect(error.name).toEqual('SequelizeDatabaseError')
        }
      }
    })

    it('should return AuthenticableUser object when existent id is provided', async () => {
      const registrationData: RegistrationData = {
        username: 'FooBar',
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo@bar.com',
        password: 'foobar'
      }

      const registeredUser = await postgresAdapter.register(registrationData)
      const user = await postgresAdapter.getUserById(registeredUser.id)

      expect(postgresAdapter.getUserById).toHaveBeenCalledTimes(1)
      expect(user.email).toEqual('foo@bar.com')
      expect(user.username).toEqual('FooBar')
      expect(user.firstName).toEqual('Foo')
      expect(user.lastName).toEqual('Bar')
    })
  })

  describe('getUserByUsername', () => {
    beforeEach(async () => {
      postgresAdapter = new PostgresAdapter()
      await postgresAdapter.setupConnectionWithConnectionUrl('postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test')
      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} })
      await postgresAdapter.models.User.destroy({ where: {} })
      jest.spyOn(postgresAdapter, 'getUserByUsername')
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should throw ValidationErrors when nonexistent username is provided', async () => {
      try {
        await postgresAdapter.getUserByUsername('foo')
        fail()
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationErrors)
        expect(postgresAdapter.getUserByUsername).toHaveBeenCalledTimes(1)
      }
    })

    it('should throw ValidationErrors when invalid username is provided', async () => {
      try {
        await postgresAdapter.getUserByUsername('')
        fail()
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationErrors)
        expect(postgresAdapter.getUserByUsername).toHaveBeenCalledTimes(1)
      }
    })

    it('should return AuthenticableUser when existent email is provided', async () => {
      const registrationData: RegistrationData = {
        username: 'FooBar',
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo@bar.com',
        password: 'foobar'
      }

      await postgresAdapter.register(registrationData)

      const user = await postgresAdapter.getUserByUsername('FooBar')

      expect(user.email).toEqual('foo@bar.com')
      expect(user.username).toEqual('FooBar')
      expect(user.firstName).toEqual('Foo')
      expect(user.lastName).toEqual('Bar')
      expect(postgresAdapter.getUserByUsername).toHaveBeenCalledTimes(1)
    })
  })

  describe('changePassword', () => {
    beforeEach(async () => {
      postgresAdapter = new PostgresAdapter()
      await postgresAdapter.setupConnectionWithConnectionUrl('postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test')
      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} })
      await postgresAdapter.models.User.destroy({ where: {} })
      jest.spyOn(postgresAdapter, 'changePassword')
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should throw ValidationErrors when nonexistent email is provided', async () => {
      try {
        await postgresAdapter.changePassword('foo@bar.com', 'foo', 'bar')
        fail()
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationErrors)
        expect(postgresAdapter.changePassword).toHaveBeenCalledTimes(1)
      }
    })

    it('should throw when invalid old password is provided', async () => {
      const registrationData: RegistrationData = {
        username: 'FooBar',
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo@bar.com',
        password: 'foobar'
      }

      await postgresAdapter.register(registrationData)
      try {
        await postgresAdapter.changePassword('foo@bar.com', 'foobaz', 'barbaz')
      } catch (error) {
        expect(postgresAdapter.changePassword).toHaveBeenCalledTimes(1)
        expect(error).toBeInstanceOf(AuthenticationError);
        if (error instanceof AuthenticationError) {
          expect(error.message).toEqual('invalid credentials');
        }
      }
    })

    it('should change password when valid information is provided', async () => {
      const registrationData: RegistrationData = {
        username: 'FooBar',
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo@bar.com',
        password: 'foobar'
      }

      await postgresAdapter.register(registrationData)
      await postgresAdapter.changePassword('foo@bar.com', 'foobar', 'foobaz')

      expect(postgresAdapter.changePassword).toHaveBeenCalledTimes(1)
      expect(postgresAdapter.changePassword).toHaveBeenCalledWith('foo@bar.com', 'foobar', 'foobaz')
    })
  })

  describe('registerTwoFactorUser', () => {
    beforeEach(async () => {
      postgresAdapter = new PostgresAdapter()
      await postgresAdapter.setupConnectionWithConnectionUrl('postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test')
      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} })
      await postgresAdapter.models.User.destroy({ where: {} })
      jest.spyOn(postgresAdapter, 'registerTwoFactorUser')
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should throw when invalid 2fa registration data is provided', async () => {
      const payload: TwoFactorRegistrationData = {
        userId: '',
        secret: '',
        provider: ''
      }

      try {
        await postgresAdapter.registerTwoFactorUser(payload)
      } catch (error) {
        expect(postgresAdapter.registerTwoFactorUser).toHaveBeenCalledTimes(1)
      }
    })

    it('should throw when a nonexistent userId is provided', async () => {
      const payload: TwoFactorRegistrationData = {
        userId: 'c82cbb0b-29db-4f8c-b2c4-8fae32b8f709',
        secret: 'foobarbaz',
        provider: 'TOTP'
      }

      try {
        await postgresAdapter.registerTwoFactorUser(payload)
      } catch (error) {
        expect(postgresAdapter.registerTwoFactorUser).toHaveBeenCalledTimes(1)
      }
    })

    it('should throw when 2fa user with the same provider already exists', async () => {
      const payload: RegistrationData = {
        username: 'FooBar',
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo@bar.com',
        password: 'foobar'
      }

      const user = await postgresAdapter.register(payload)

      const twoFactorPayload: TwoFactorRegistrationData = {
        userId: user.id,
        secret: 'foobarbaz',
        provider: 'TOTP'
      }

      await postgresAdapter.registerTwoFactorUser(twoFactorPayload)

      try {
        await postgresAdapter.registerTwoFactorUser(twoFactorPayload)
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationErrors)
        expect(postgresAdapter.registerTwoFactorUser).toHaveBeenCalledTimes(2)
      }
    })

    it('should return an AuthenticableTwoFactorUser object when data is valid', async () => {
      const payload: RegistrationData = {
        username: 'FooBar',
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo@bar.com',
        password: 'foobar',
      }

      const user = await postgresAdapter.register(payload)

      const twoFactorPayload: TwoFactorRegistrationData = {
        userId: user.id,
        secret: 'foobarbaz',
        provider: 'TOTP'
      }

      const twoFactorUser = await postgresAdapter.registerTwoFactorUser(twoFactorPayload)

      expect(postgresAdapter.registerTwoFactorUser).toHaveBeenCalledTimes(1)
      expect(twoFactorUser.provider).toEqual(twoFactorPayload.provider)
      expect(twoFactorUser.secret).toEqual(twoFactorPayload.secret)
      expect(twoFactorUser.userId).toEqual(twoFactorPayload.userId)
    })

    it(`should return an AuthenticableTwoFactorUser object when 2fa user with provided userId exists,
     but different provider is provided`, async () => {
      const payload: RegistrationData = {
        username: 'FooBar',
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo@bar.com',
        password: 'foobar',
      }

      const user = await postgresAdapter.register(payload)

      const twoFactorPayload: TwoFactorRegistrationData = {
        userId: user.id,
        secret: 'foobarbaz',
        provider: 'TOTP'
      }

      await postgresAdapter.registerTwoFactorUser(twoFactorPayload)

      const twoFactorPayload2: TwoFactorRegistrationData = {
        userId: user.id,
        secret: 'foobarbaz',
        provider: 'OTP'
      }

      const twoFactorUser = await postgresAdapter.registerTwoFactorUser(twoFactorPayload2)
      expect(postgresAdapter.registerTwoFactorUser).toHaveBeenCalledTimes(2)
      expect(twoFactorUser.provider).toEqual(twoFactorPayload2.provider)
      expect(twoFactorUser.secret).toEqual(twoFactorPayload2.secret)
      expect(twoFactorUser.userId).toEqual(twoFactorPayload2.userId)
    })
  })

  describe('getTwoFactorUser', () => {
    beforeEach(async () => {
      postgresAdapter = new PostgresAdapter()
      await postgresAdapter.setupConnectionWithConnectionUrl('postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test')
      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} })
      await postgresAdapter.models.User.destroy({ where: {} })
      jest.spyOn(postgresAdapter, 'getTwoFactorUser')
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should throw ValidationErrors when nonexistent AuthenticableUser object is provided', async () => {
      const user: AuthenticableUser = {
        id: 'c82cbb0b-29db-4f8c-b2c4-8fae32b8f709', // randomly generated UUIDV4
        username: 'FooBar',
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo@bar.com'
      }

      try {
        await postgresAdapter.getTwoFactorUser(user)
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationErrors)
        expect(postgresAdapter.getTwoFactorUser).toHaveBeenCalledTimes(1)
      }
    })

    it('should throw when invalid data is provided', async () => {
      const payload: AuthenticableUser = {
        id: '',
        username: '',
        firstName: '',
        lastName: '',
        email: ''
      }

      try {
        await postgresAdapter.getTwoFactorUser(payload)
      } catch (error) {
        expect(postgresAdapter.getTwoFactorUser).toHaveBeenCalledTimes(1)
      }
    })

    it('should return an AuthenticableTwoFactorUser object when existent AuthenticableUser object is provided', async () => {
      const payload: RegistrationData = {
        username: 'FooBar',
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo@bar.com',
        password: 'foobar',
      }

      const user = await postgresAdapter.register(payload)

      const twoFactorPayload: TwoFactorRegistrationData = {
        userId: user.id,
        secret: 'foobarbaz',
        provider: 'TOTP'
      }

      await postgresAdapter.registerTwoFactorUser(twoFactorPayload)

      const twoFactorUser = await postgresAdapter.getTwoFactorUser(user)

      expect(postgresAdapter.getTwoFactorUser).toHaveBeenCalledTimes(1)
      expect(twoFactorUser.userId).toEqual(user.id)
      expect(twoFactorUser.provider).toEqual(twoFactorPayload.provider)
      expect(twoFactorUser.secret).toEqual(twoFactorPayload.secret)
    })
  })

  describe("getUsersTwoFactorProvidersByEmail", () => {
    beforeEach(async () => {
      postgresAdapter = new PostgresAdapter()
      await postgresAdapter.setupConnectionWithConnectionUrl('postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test')
      await postgresAdapter.models.TwoFactorUser.destroy({ where: {} })
      await postgresAdapter.models.User.destroy({ where: {} })
      jest.spyOn(postgresAdapter, 'getUsersTwoFactorProvidersByEmail')
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it("should throw ValidationErrors when a nonexistent email is provided", async () => {
      try {
        await postgresAdapter.getUsersTwoFactorProvidersByEmail("foo@bar.com")
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationErrors)
        expect(postgresAdapter.getUsersTwoFactorProvidersByEmail).toHaveBeenCalledTimes(1)
      }
    })

    it("should return an empty array if no 2fa provider is enabled for the provided email", async () => {
      const payload: RegistrationData = {
        username: 'FooBar',
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo@bar.com',
        password: 'foobar',
      }

      await postgresAdapter.register(payload)

      const providers = await postgresAdapter.getUsersTwoFactorProvidersByEmail("foo@bar.com")

      expect(postgresAdapter.getUsersTwoFactorProvidersByEmail).toHaveBeenCalledTimes(1);

      expect(providers.length).toEqual(0);
    });

    it("should return an array of providers names that are enabled for the provided email", async () => {
      const payload: RegistrationData = {
        username: 'FooBar',
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo@bar.com',
        password: 'foobar',
        twoFactorAuthenticationProvider: "TOTP"
      }

      const user = await postgresAdapter.register(payload)

      const providers = await postgresAdapter.getUsersTwoFactorProvidersByEmail("foo@bar.com")

      const twoFactorPayload: TwoFactorRegistrationData = {
        userId: user.id,
        secret: 'foobarbaz',
        provider: 'TOTP'
      }

      const twoFactorUser = await postgresAdapter.registerTwoFactorUser(twoFactorPayload)

      expect(postgresAdapter.getUsersTwoFactorProvidersByEmail).toHaveBeenCalledTimes(1);

      expect(providers.length).toEqual(1);

    });
  })
})

// describe("getTwoFactorUserByEmail", () => {
//   beforeEach(async () => {
//     postgresAdapter = new PostgresAdapter();
//     await postgresAdapter.setupConnectionWithConnectionUrl("postgres://postgres:postgrespw@127.0.0.1:5432/felony_auth_test");
//     await postgresAdapter.models.TwoFactorUser.destroy({ where: {} });
//     await postgresAdapter.models.User.destroy({ where: {} });
//     jest.spyOn(postgresAdapter, "getTwoFactorUserByEmail");
//   });

//   afterEach(() => {
//     jest.resetAllMocks();
//   });

//   it("should throw ValidationErrors when nonexistent email is provided", async () => {
//     try {
//       await postgresAdapter.getTwoFactorUserByEmail("foo@bar.com")
//     } catch (error) {
//       console.log(error);
//       expect(postgresAdapter.getTwoFactorUserByEmail).toHaveBeenCalledTimes(1);
//     }
//   });
// });
//   it("should throw ValidationErrors when nonexistent id is provided")
// });


// describe("registerTwoFactorUser", () => {
//   let postgresAdapter: PostgresAdapter;
//   let user: AuthenticableUser;

//   beforeAll(async () => {
//     // await postgresAdapter.models.User.destroy({ where: {} });
//     // const registrationData: RegistrationData = {
//     //   username: "FooBar",
//     //   firstName: "Foo",
//     //   lastName: "Bar",
//     //   email: "foo@bar.com",
//     //   password: "foobar",
//     //   
//     // };
//     // user = await postgresAdapter.register(registrationData);
//     await TwoFactorUser.destroy({ where: {} });
//   });

//   beforeEach(() => {
//     postgresAdapter = new PostgresAdapter();
//     jest.spyOn(postgresAdapter, "registerTwoFactorUser");
//   });

//   afterEach(() => {
//     jest.resetAllMocks();
//   });

//   it("should register should return a AuthenticableTwoFactorUser object when new user is registered", () => {
//     const payload: TwoFactorRegistrationData = {
//       userId: user.id,
//       secret: "",
//       provider: ""
//     };
//   });
// });
type AuthenticableTwoFactorUser = {
  id: string,
  email: string,
  provider: string,
  secret: string,
}

export default AuthenticableTwoFactorUser;
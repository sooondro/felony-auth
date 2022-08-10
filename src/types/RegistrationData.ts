/**
 * Data required for the registration process.
 */
type RegistrationData = {
  /**
   * User's username.
   */
  username: string,

  /**
   * User's first name.
   */
  firstName: string,

  /**
   * User's last name.
   */
  lastName: string,

  /**
   * User's email. 
   */
  email: string,
  
  /**
   * User's password.
   */
  password: string,

  /**
   * Two-factor authentication flag.
   */
  twoFactorAuthentication: boolean,
};

export default RegistrationData;
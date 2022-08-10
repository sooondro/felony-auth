/**
 * Authenticable user. 
 */
type AuthenticableUser =  {
  /**
   * User's ID.
   */
  id: string,
  
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
}

export default AuthenticableUser;
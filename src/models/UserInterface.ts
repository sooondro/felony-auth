/**
 * Interface for the user.
 */
interface UserInterface {
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
}

export default UserInterface;
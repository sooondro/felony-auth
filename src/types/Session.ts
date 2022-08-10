import AuthenticableUser from "./AuthenticableUser";

type Session = {
  id: string,
  csrf: string,
  user: AuthenticableUser
};

export default Session;
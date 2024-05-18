export default interface IUser {
  id?: any | null,
  email?: string,
  password?: string,
  roles?: Array<string>,
  accessToken?: string
}

export class User {
  constructor(
    public id: string,
    public uuid: string,
    public firstName: string,
    public lastName: string,
    public email: string,
    public phone: string,
    public type: string,
    public status: string,
    public password: string,
    public confirmPassword: string,
    public image: string
  ) {}
}

export default class ErrorHandler {
  private status: number;
  private message: string;
  private redirect: boolean;

  constructor(status = 0, message: string, redirect = false) {
    this.status = status;
    this.message = message;
    this.redirect = redirect;
  }
}

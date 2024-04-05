export class Logger {
  constructor() {}

  info(message: string, object?: any): void {
    if (object) {
      console.log(message, object);
    } else {
      console.log(message);
    }
  }

  error(message: string, object?: any): void {
    if (object) {
      console.log(message, object);
    } else {
      console.log(message);
    }
  }
}

export const customLogger = new Logger();

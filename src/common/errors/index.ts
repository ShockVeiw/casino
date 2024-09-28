import { Request, Response, NextFunction } from 'express';

export class ApplicationException extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function produceCustomError(statusCode: number, message: string) {
  return class extends ApplicationException {
    constructor() {
      super(statusCode, message);
    }
  };
}

export const controllerWrapper = (
  controller: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    controller(req, res, next).catch(next);
  };
};

export * from './users';
export * from './sessions';

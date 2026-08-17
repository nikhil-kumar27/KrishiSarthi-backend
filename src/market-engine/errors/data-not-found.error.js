export class DataNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DataNotFoundError';
    this.code = 'DATA_NOT_FOUND';
    this.statusCode = 404;
  }
}
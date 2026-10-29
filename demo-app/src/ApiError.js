// Shared error type. Kept in its own module so both api.js and demoApi.js can
// import it without a circular dependency.
export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields || {};
  }
}

/** This should be used for application errors that require a sensible message for the user */
export class AppError extends Error {
  statusCode = 400;
  static typeToCode = {
    validation: 400,
    unauthorised: 401,
    server: 500,
  };
  constructor(type: keyof typeof AppError.typeToCode, message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = Error.name;
    this.statusCode = AppError.typeToCode[type];
    Error.captureStackTrace(this);
  }
}

/** This should be used if a required environment variable is not set */
export class EnvVarNotSet extends Error {
  constructor(envVar: string) {
    super();
    this.message = `${envVar} environment variable not set.`;
  }
}

/** This should be used if the options used to generate a token are invalid */
export class InvalidTokenOptions extends Error {
  constructor() {
    super();
    this.message = 'Invalid token options';
  }
}

/** This should be used if the token verification process fails */
export class InvalidToken extends Error {
  constructor(reason: string) {
    super();
    this.message = reason;
  }
}

/** This should be used if the database is unable to delete a token, usually because it has already been deleted */
export class CannotRevokeToken extends Error {
  constructor(token: string) {
    super();
    this.message = `Cannot revoke token ${token}`;
  }
}

/** This should be used when the database cannot find a specified record */
export class RecordNotFound extends Error {
  constructor(record: string) {
    super();
    this.message = `${record} not found`;
  }
}

/** This should be used the domain check fails */
export class DomainCheckNotValid extends Error {
  constructor(domain: string) {
    super();
    this.message = `Domain check failed validity test. Is ${domain} pointing to this server instance?`;
  }
}

/** This should be used if the domain was not specified in production mode */
export class DomainNotSpecified extends Error {
  constructor() {
    super();
    this.message =
      'Domain was not specified in a production environment. Set a domain by specifying --domain example.com whilst running (replace example.com with your domain)';
  }
}

/** This should be used when the server version doesn't fit the format of semantic versioning */
export class NotValidVersion extends Error {
  constructor(version: string) {
    super();
    this.message = `"${version}" is not a valid version. Make sure you're using semantic versioning (https://semver.org/).`;
  }
}

/** This should be used when trying to fetch the package.json's version and it is not present */
export class PackageVersionNotFound extends Error {
  constructor() {
    super();
    this.message =
      'Package.json version could not be found. Does the file exist?';
  }
}

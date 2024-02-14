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

export class EnvVarNotSet extends Error {
  constructor(envVar: string) {
    super();
    this.message = `${envVar} environment variable not set.`;
  }
}

export class InvalidTokenOptions extends Error {
  constructor() {
    super();
    this.message = 'Invalid token options';
  }
}

export class InvalidToken extends Error {
  constructor(reason: string) {
    super();
    this.message = reason;
  }
}

export class CannotRevokeToken extends Error {
  constructor(token: string) {
    super();
    this.message = `Cannot revoke token ${token}`;
  }
}

export class RecordNotFound extends Error {
  constructor(record: string) {
    super();
    this.message = `${record} not found`;
  }
}

export class DomainCheckNotValid extends Error {
  constructor(domain: string) {
    super();
    this.message = `Domain check failed validity test. Is ${domain} pointing to this server instance?`;
  }
}

export class DomainNotSpecified extends Error {
  constructor() {
    super();
    this.message =
      'Domain was not specified in a production environment. Set a domain by specifying --domain=example.com whilst running (replace example.com with your domain)';
  }
}

export class NotValidVersion extends Error {
  constructor(version: string) {
    super();
    this.message = `"${version}" is not a valid version. Make sure you're using semantic versioning (https://semver.org/).`;
  }
}

export class PackageVersionNotFound extends Error {
  constructor() {
    super();
    this.message =
      'Package.json version could not be found. Does the file exist?';
  }
}

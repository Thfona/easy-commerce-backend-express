class EnvironmentUtil {
  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  get databaseHost(): string {
    return process.env.DB_HOST || 'mongodb://localhost:27017/easyCommerceDB';
  }

  get serverPort(): string {
    return process.env.PORT || '3000';
  }

  get accessTokenSecret(): string {
    if (process.env.ACCESS_TOKEN_SECRET) {
      return process.env.ACCESS_TOKEN_SECRET;
    }

    throw new Error('Access token secret is undefined.');
  }

  get refreshTokenSecret(): string {
    if (process.env.REFRESH_TOKEN_SECRET) {
      return process.env.REFRESH_TOKEN_SECRET;
    }

    throw new Error('Refresh token secret is undefined.');
  }

  get validationTokenSecret(): string {
    if (process.env.VALIDATION_TOKEN_SECRET) {
      return process.env.VALIDATION_TOKEN_SECRET;
    }

    throw new Error('Validation token secret is undefined.');
  }
}

export const environmentUtil = new EnvironmentUtil();

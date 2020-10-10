class Environment {
  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }
}

export default new Environment();

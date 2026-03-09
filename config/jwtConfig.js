module.exports = {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: '24h',
    COOKIE_NAME: 'payroll_token',
    COOKIE_OPTIONS: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 1000,
    },
};

export const getCookieOption = () => {
    const age = 3600 * 1000 * 24;
    return {
        httpOnly: true,
        secure: true,
        maxAge: age,
    };
};

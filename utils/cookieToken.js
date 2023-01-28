const cookieToken = (user, resp) => {
    const token = user.getJWTToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    user.password = undefined;
    resp.status(201).cookie("token", token, options).json({
        success: true,
        token,
        user,
    });
};

module.exports = cookieToken;

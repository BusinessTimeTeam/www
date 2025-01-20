module.exports = (config) => {
    config.setServerOptions({
        host: "0.0.0.0",
    });
    return {
        dir: {
            input: "src",
            output: "dist",
        },
    };
};

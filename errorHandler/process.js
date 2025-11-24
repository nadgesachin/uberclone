const log_exception = (event) => {
    process.on(event, (err) => {
        console.error(`process.on[${event}]`, err.stack || err);
    });
};
module.exports = function () {
    const events = [
        "syntaxError",
        "uncaughtException",
        "unhandledRejection",
        "doesNotExist",
        "ServiceUnavailableError",
        "TypeError",
    ];
    for (let event of events) {
        log_exception(event);
    }
    process.on("exit", (code) => {
        console.log(`About to exit with code: ${code}`);
    });
};

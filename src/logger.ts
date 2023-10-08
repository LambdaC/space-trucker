class ConsoleProxy {

    private _console: Console;
    private _consoleIsPresent: Console;
    private _messageBuffer: { type: string, message: string }[] = [];

    constructor(console: Console) {
        this._console = console;
        this._consoleIsPresent = this._console;
    }

    logInfo(message: string) {
        const logObj = { type: "INFO", message: message };
        if (this._consoleIsPresent) {
            this._console.log(logObj);
            return;
        }
        this._messageBuffer.push(logObj);
    }

    logWarning(message: string) {
        const logObj = { type: "WARN", message: message };
        if (this._consoleIsPresent) {
            this._console.log(logObj);
            return;
        }
        this._messageBuffer.push(logObj);
    }

    logError(message: string) {
        const logObj = { type: "ERROR", message: message };
        if (this._consoleIsPresent) {
            this._console.log(logObj);
            return;
        }
        this._messageBuffer.push(logObj);
    }

    logFatal(message: string) {
        const logObj = { type: "FATAL", message: message };
        if (this._consoleIsPresent) {
            this._console.log(logObj);
            return;
        }
        this._messageBuffer.push(logObj);
    }

    flushBuffer() {
        this._messageBuffer.splice(0, this._messageBuffer.length);
    }
}

const theProxy = new ConsoleProxy(console);
export default theProxy;
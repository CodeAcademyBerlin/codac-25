"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
var Logger = /** @class */ (function () {
    function Logger() {
        this.isDevelopment = process.env.NODE_ENV === 'development';
        this.isProduction = process.env.NODE_ENV === 'production';
    }
    Logger.prototype.formatMessage = function (level, message, context) {
        return {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            context: context,
        };
    };
    Logger.prototype.output = function (logEntry) {
        if (this.isDevelopment) {
            // Pretty print for development
            var contextStr = logEntry.context
                ? "\n  Context: ".concat(JSON.stringify(logEntry.context, null, 2))
                : '';
            // eslint-disable-next-line no-console
            console.log("[".concat(logEntry.timestamp, "] ").concat(logEntry.level, ": ").concat(logEntry.message).concat(contextStr));
        }
        else if (this.isProduction) {
            // Structured JSON for production (for log aggregation)
            // eslint-disable-next-line no-console
            console.log(JSON.stringify(logEntry));
        }
    };
    Logger.prototype.debug = function (message, context) {
        if (this.isDevelopment) {
            this.output(this.formatMessage('DEBUG', message, context));
        }
    };
    Logger.prototype.info = function (message, context) {
        this.output(this.formatMessage('INFO', message, context));
    };
    Logger.prototype.warn = function (message, context) {
        this.output(this.formatMessage('WARN', message, context));
    };
    Logger.prototype.error = function (message, error, context) {
        var logEntry = this.formatMessage('ERROR', message, context);
        if (error) {
            logEntry.error = {
                name: error.name,
                message: error.message,
                stack: error.stack,
            };
        }
        this.output(logEntry);
    };
    // Specialized logging methods for common operations
    Logger.prototype.logServerAction = function (action, resource, context) {
        this.info("Server action: ".concat(action), __assign({ action: action, resource: resource }, context));
    };
    Logger.prototype.logServerActionError = function (action, resource, error, context) {
        this.error("Server action failed: ".concat(action), error, __assign({ action: action, resource: resource }, context));
    };
    Logger.prototype.logDatabaseOperation = function (operation, table, recordId, context) {
        this.debug("Database ".concat(operation), __assign({ action: operation, resource: table, resourceId: recordId }, context));
    };
    Logger.prototype.logValidationError = function (resource, errors, context) {
        this.warn("Validation failed for ".concat(resource), __assign({ resource: resource, metadata: { validationErrors: errors } }, context));
    };
    Logger.prototype.logPermissionDenied = function (action, resource, userId, context) {
        this.warn("Permission denied: ".concat(action, " on ").concat(resource), __assign({ action: action, resource: resource, userId: userId }, context));
    };
    Logger.prototype.logAuthEvent = function (event, userId, context) {
        this.info("Auth event: ".concat(event), __assign({ action: event, resource: 'auth', userId: userId }, context));
    };
    return Logger;
}());
// Export singleton instance
exports.logger = new Logger();

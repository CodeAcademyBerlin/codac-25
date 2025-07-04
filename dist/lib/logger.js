"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
class Logger {
    isDevelopment = process.env.NODE_ENV === 'development';
    isProduction = process.env.NODE_ENV === 'production';
    formatMessage(level, message, context) {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
        };
    }
    output(logEntry) {
        if (this.isDevelopment) {
            // Pretty print for development
            const contextStr = logEntry.context
                ? `\n  Context: ${JSON.stringify(logEntry.context, null, 2)}`
                : '';
            // eslint-disable-next-line no-console
            console.log(`[${logEntry.timestamp}] ${logEntry.level}: ${logEntry.message}${contextStr}`);
        }
        else if (this.isProduction) {
            // Structured JSON for production (for log aggregation)
            // eslint-disable-next-line no-console
            console.log(JSON.stringify(logEntry));
        }
    }
    debug(message, context) {
        if (this.isDevelopment) {
            this.output(this.formatMessage('DEBUG', message, context));
        }
    }
    info(message, context) {
        this.output(this.formatMessage('INFO', message, context));
    }
    warn(message, context) {
        this.output(this.formatMessage('WARN', message, context));
    }
    error(message, error, context) {
        const logEntry = this.formatMessage('ERROR', message, context);
        if (error) {
            logEntry.error = {
                name: error.name,
                message: error.message,
                stack: error.stack,
            };
        }
        this.output(logEntry);
    }
    // Specialized logging methods for common operations
    logServerAction(action, resource, context) {
        this.info(`Server action: ${action}`, {
            action,
            resource,
            ...context,
        });
    }
    logServerActionError(action, resource, error, context) {
        this.error(`Server action failed: ${action}`, error, {
            action,
            resource,
            ...context,
        });
    }
    logDatabaseOperation(operation, table, recordId, context) {
        this.debug(`Database ${operation}`, {
            action: operation,
            resource: table,
            resourceId: recordId,
            ...context,
        });
    }
    logValidationError(resource, errors, context) {
        this.warn(`Validation failed for ${resource}`, {
            resource,
            metadata: { validationErrors: errors },
            ...context,
        });
    }
    logPermissionDenied(action, resource, userId, context) {
        this.warn(`Permission denied: ${action} on ${resource}`, {
            action,
            resource,
            userId,
            ...context,
        });
    }
    logAuthEvent(event, userId, context) {
        this.info(`Auth event: ${event}`, {
            action: event,
            resource: 'auth',
            userId,
            ...context,
        });
    }
}
// Export singleton instance
exports.logger = new Logger();

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogContext {
    userId?: string;
    action?: string;
    resource?: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
}

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: LogContext;
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === 'development';
    private isProduction = process.env.NODE_ENV === 'production';

    private formatMessage(level: LogLevel, message: string, context?: LogContext): LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
        };
    }

    private output(logEntry: LogEntry) {
        if (this.isDevelopment) {
            // Pretty print for development
            const contextStr = logEntry.context
                ? `\n  Context: ${JSON.stringify(logEntry.context, null, 2)}`
                : '';

            // eslint-disable-next-line no-console
            console.log(
                `[${logEntry.timestamp}] ${logEntry.level}: ${logEntry.message}${contextStr}`
            );
        } else if (this.isProduction) {
            // Structured JSON for production (for log aggregation)
            // eslint-disable-next-line no-console
            console.log(JSON.stringify(logEntry));
        }
    }

    debug(message: string, context?: LogContext) {
        if (this.isDevelopment) {
            this.output(this.formatMessage('DEBUG', message, context));
        }
    }

    info(message: string, context?: LogContext) {
        this.output(this.formatMessage('INFO', message, context));
    }

    warn(message: string, context?: LogContext) {
        this.output(this.formatMessage('WARN', message, context));
    }

    error(message: string, error?: Error, context?: LogContext) {
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
    logServerAction(action: string, resource: string, context?: Omit<LogContext, 'action' | 'resource'>) {
        this.info(`Server action: ${action}`, {
            action,
            resource,
            ...context,
        });
    }

    logServerActionError(action: string, resource: string, error: Error, context?: Omit<LogContext, 'action' | 'resource'>) {
        this.error(`Server action failed: ${action}`, error, {
            action,
            resource,
            ...context,
        });
    }

    logDatabaseOperation(operation: string, table: string, recordId?: string, context?: LogContext) {
        this.debug(`Database ${operation}`, {
            action: operation,
            resource: table,
            resourceId: recordId,
            ...context,
        });
    }

    logValidationError(resource: string, errors: unknown, context?: LogContext) {
        this.warn(`Validation failed for ${resource}`, {
            resource,
            metadata: { validationErrors: errors },
            ...context,
        });
    }

    logPermissionDenied(action: string, resource: string, userId?: string, context?: LogContext) {
        this.warn(`Permission denied: ${action} on ${resource}`, {
            action,
            resource,
            userId,
            ...context,
        });
    }

    logAuthEvent(event: string, userId?: string, context?: LogContext) {
        this.info(`Auth event: ${event}`, {
            action: event,
            resource: 'auth',
            userId,
            ...context,
        });
    }
}

// Export singleton instance
export const logger = new Logger();

// Export types for use in other files
export type { LogLevel, LogContext, LogEntry }; 
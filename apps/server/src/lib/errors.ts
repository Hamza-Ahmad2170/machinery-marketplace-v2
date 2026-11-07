import {
	type ApiErrorStatus,
	apiErrorStatuses,
	type ErrorCode,
	type ProblemDetails,
} from "@repo/validators";
import type { Context, ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";

const titles: Record<ApiErrorStatus, string> = {
	400: "Bad Request",
	401: "Unauthorized",
	403: "Forbidden",
	404: "Not Found",
	409: "Conflict",
	422: "Unprocessable Content",
	429: "Too Many Requests",
	500: "Internal Server Error",
};

const defaultCodes: Record<ApiErrorStatus, ErrorCode> = {
	400: "BAD_REQUEST",
	401: "UNAUTHORIZED",
	403: "FORBIDDEN",
	404: "NOT_FOUND",
	409: "CONFLICT",
	422: "VALIDATION_FAILED",
	429: "RATE_LIMITED",
	500: "INTERNAL_ERROR",
};

export type FieldErrors = Record<string, string[]>;

export interface ApiErrorOptions {
	code?: ErrorCode;
	/** Problem type URI. Defaults to "about:blank" (RFC 9457 §4.2.1). */
	type?: string;
	fieldErrors?: FieldErrors;
	cause?: unknown;
}

/** Throw from any handler or middleware; `handleError` turns it into an RFC 9457 response. */
export class ApiError extends Error {
	readonly status: ApiErrorStatus;
	readonly code: ErrorCode;
	readonly type: string;
	readonly detail?: string;
	readonly fieldErrors?: FieldErrors;

	constructor(status: ApiErrorStatus, detail?: string, options: ApiErrorOptions = {}) {
		super(detail ?? titles[status], { cause: options.cause });
		this.name = "ApiError";
		this.status = status;
		this.code = options.code ?? defaultCodes[status];
		this.type = options.type ?? "about:blank";
		this.detail = detail;
		this.fieldErrors = options.fieldErrors;
	}

	static badRequest(detail?: string, options?: ApiErrorOptions) {
		return new ApiError(400, detail, options);
	}
	static unauthorized(detail = "Sign in to continue", options?: ApiErrorOptions) {
		return new ApiError(401, detail, options);
	}
	static forbidden(detail?: string, options?: ApiErrorOptions) {
		return new ApiError(403, detail, options);
	}
	static notFound(detail?: string, options?: ApiErrorOptions) {
		return new ApiError(404, detail, options);
	}
	static conflict(detail?: string, options?: ApiErrorOptions) {
		return new ApiError(409, detail, options);
	}
	static validation(fieldErrors: FieldErrors, detail = "Request validation failed") {
		return new ApiError(422, detail, { fieldErrors });
	}

	toProblem(instance?: string): ProblemDetails {
		return {
			type: this.type,
			title: titles[this.status],
			status: this.status,
			code: this.code,
			...(this.detail !== undefined && { detail: this.detail }),
			...(instance !== undefined && { instance }),
			...(this.fieldErrors !== undefined && { fieldErrors: this.fieldErrors }),
		};
	}
}

function problemResponse(c: Context, problem: ProblemDetails & { status: ApiErrorStatus }) {
	return c.json(problem, problem.status, { "Content-Type": "application/problem+json" });
}

function toApiStatus(status: number): ApiErrorStatus {
	return (apiErrorStatuses as readonly number[]).includes(status)
		? (status as ApiErrorStatus)
		: status >= 500
			? 500
			: 400;
}

export const handleError: ErrorHandler = (err, c) => {
	const instance = c.req.path;

	if (err instanceof ApiError) {
		if (err.status >= 500) console.error(err);
		return problemResponse(c, { ...err.toProblem(instance), status: err.status });
	}

	// Thrown by Hono itself or third-party middleware (e.g. body limit, malformed JSON)
	if (err instanceof HTTPException) {
		const error = new ApiError(toApiStatus(err.status), err.message || undefined);
		return problemResponse(c, { ...error.toProblem(instance), status: error.status });
	}

	// Never leak internal messages to clients
	console.error(err);
	const error = new ApiError(500, "An unexpected error occurred");
	return problemResponse(c, { ...error.toProblem(instance), status: error.status });
};

export const handleNotFound: NotFoundHandler = (c) => {
	const error = ApiError.notFound(`No route for ${c.req.method} ${c.req.path}`);
	return problemResponse(c, { ...error.toProblem(c.req.path), status: error.status });
};

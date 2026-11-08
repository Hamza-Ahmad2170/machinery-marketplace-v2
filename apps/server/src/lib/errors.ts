import {
	type ApiErrorStatus,
	apiErrorStatuses,
	type ErrorCode,
	type FieldErrors,
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

export interface ApiErrorOptions {
	/** Defaults to the status's generic code, e.g. 404 → "NOT_FOUND". */
	code?: ErrorCode;
	fieldErrors?: FieldErrors;
	cause?: unknown;
}

/**
 * The one error class for the API. Throw it from services, middleware or handlers;
 * `handleError` turns it into an RFC 9457 problem response.
 *
 *   throw ApiError.notFound("Listing not found");
 *   throw ApiError.forbidden("Only the seller can edit this listing");
 */
export class ApiError extends Error {
	readonly status: ApiErrorStatus;
	readonly code: ErrorCode;
	/** Message safe to show to users. Never put internal details here. */
	readonly detail?: string;
	readonly fieldErrors?: FieldErrors;

	constructor(status: ApiErrorStatus, detail?: string, options: ApiErrorOptions = {}) {
		super(detail ?? titles[status], { cause: options.cause });
		this.name = "ApiError";
		this.status = status;
		this.code = options.code ?? defaultCodes[status];
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
	static validation(fieldErrors: FieldErrors, detail = "Some fields are invalid") {
		return new ApiError(422, detail, { fieldErrors });
	}

	toProblem(instance: string): ProblemDetails {
		return {
			type: "about:blank",
			title: titles[this.status],
			status: this.status,
			code: this.code,
			instance,
			...(this.detail !== undefined && { detail: this.detail }),
			...(this.fieldErrors !== undefined && { fieldErrors: this.fieldErrors }),
		};
	}
}

/** Error bodies every route can return. Applied to AppType in app.ts with ApplyGlobalResponse. */
export type ErrorResponses = { [S in ApiErrorStatus]: { json: ProblemDetails } };

function problemResponse(c: Context, error: ApiError) {
	return c.json(error.toProblem(c.req.path), error.status, {
		"Content-Type": "application/problem+json",
	});
}

/** Maps a status from Hono or third-party middleware onto one the API declares. */
function toApiStatus(status: number): ApiErrorStatus {
	if ((apiErrorStatuses as readonly number[]).includes(status)) return status as ApiErrorStatus;
	return status >= 500 ? 500 : 400;
}

export const handleError: ErrorHandler = (err, c) => {
	if (err instanceof ApiError) {
		if (err.status >= 500) console.error(err);
		return problemResponse(c, err);
	}

	// Thrown by Hono or its middleware, e.g. malformed JSON in a validated body.
	if (err instanceof HTTPException) {
		if (err.status >= 500) console.error(err);
		return problemResponse(c, new ApiError(toApiStatus(err.status), err.message || undefined));
	}

	// Anything else is a bug. Log it, and never send its message to the client.
	console.error(err);
	return problemResponse(c, new ApiError(500, "Something went wrong on our side"));
};

export const handleNotFound: NotFoundHandler = (c) =>
	problemResponse(c, ApiError.notFound(`No route for ${c.req.method} ${c.req.path}`));

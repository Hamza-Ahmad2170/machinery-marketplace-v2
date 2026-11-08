import { type ErrorCode, type FieldErrors, problemDetails } from "@repo/validators";
import { DetailedError } from "hono/client";

/**
 * The server's error codes plus two the client adds:
 * - `NETWORK_ERROR`: no response arrived (offline, DNS failure, blocked by CORS).
 * - `UNEXPECTED_RESPONSE`: the response wasn't a ProblemDetails body, such as a proxy's 502 page.
 */
export type ApiClientErrorCode = ErrorCode | "NETWORK_ERROR" | "UNEXPECTED_RESPONSE";

type ApiClientErrorInit = {
	status: number;
	code: ApiClientErrorCode;
	fieldErrors?: FieldErrors | undefined;
	cause?: unknown;
};

/** Thrown by `unwrap` for every failed call. Branch on `code`. `message` is safe to show to users. */
export class ApiClientError extends Error {
	override readonly name = "ApiClientError";
	/** HTTP status, or 0 when no response arrived. */
	readonly status: number;
	readonly code: ApiClientErrorCode;
	/** Messages per field, keyed by dotted path. Empty unless `code` is VALIDATION_FAILED. */
	readonly fieldErrors: FieldErrors;

	constructor(message: string, init: ApiClientErrorInit) {
		super(message, { cause: init.cause });
		this.status = init.status;
		this.code = init.code;
		this.fieldErrors = init.fieldErrors ?? {};
	}
}

export function toApiClientError(error: unknown): ApiClientError {
	if (error instanceof ApiClientError) {
		return error;
	}

	// parseResponse throws DetailedError for error statuses, with the parsed body in detail.data.
	if (error instanceof DetailedError) {
		const status = Number(error.statusCode) || 0;
		const problem = problemDetails.safeParse(error.detail?.data);
		if (problem.success) {
			const { detail, title, code, fieldErrors } = problem.data;
			return new ApiClientError(detail ?? title, { status, code, fieldErrors, cause: error });
		}
		return new ApiClientError("Something went wrong. Please try again.", {
			status,
			code: "UNEXPECTED_RESPONSE",
			cause: error,
		});
	}

	// fetch rejects with a TypeError when the request gets no response at all.
	if (error instanceof TypeError) {
		return new ApiClientError("Can't reach the server. Check your connection and try again.", {
			status: 0,
			code: "NETWORK_ERROR",
			cause: error,
		});
	}

	return new ApiClientError("Something went wrong. Please try again.", {
		status: 0,
		code: "UNEXPECTED_RESPONSE",
		cause: error,
	});
}

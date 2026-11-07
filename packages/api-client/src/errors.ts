import { type ErrorCode, type ProblemDetails, problemDetails } from "@repo/validators";
import { type ClientResponse, parseResponse } from "hono/client";
import type { StatusCode } from "hono/utils/http-status";

/** Every failed API call surfaces as this error, with the server's RFC 9457 body attached. */
export class ProblemError extends Error {
	readonly problem: ProblemDetails;

	constructor(problem: ProblemDetails, options?: { cause?: unknown }) {
		super(problem.detail ?? problem.title, options);
		this.name = "ProblemError";
		this.problem = problem;
	}

	get status() {
		return this.problem.status;
	}
	get code(): ErrorCode {
		return this.problem.code;
	}
	/** First message per field, ready to show next to form inputs. */
	fieldError(field: string): string | undefined {
		return this.problem.fieldErrors?.[field]?.[0];
	}
}

function fallbackProblem(status: number, statusText: string): ProblemDetails {
	return {
		type: "about:blank",
		title: statusText || "Request failed",
		status,
		code: status >= 500 ? "INTERNAL_ERROR" : "BAD_REQUEST",
	};
}

/**
 * Awaits an RPC call and returns its typed success body, or throws `ProblemError`.
 * Use in every queryFn / mutationFn: `queryFn: () => unwrap(api.api.listings.$get())`.
 */
export async function unwrap<T extends ClientResponse<unknown, StatusCode, string>>(
	request: Promise<T>,
) {
	let response: T;
	try {
		response = await request;
	} catch (cause) {
		throw new ProblemError(
			{
				type: "about:blank",
				title: "Network error",
				status: 0,
				detail: "Could not reach the server",
				code: "NETWORK_ERROR",
			},
			{ cause },
		);
	}

	if (!response.ok) {
		const body: unknown = await response.json().catch(() => null);
		const parsed = problemDetails.safeParse(body);
		throw new ProblemError(
			parsed.success ? parsed.data : fallbackProblem(response.status, response.statusText),
		);
	}

	return parseResponse(response);
}

declare module "@tanstack/react-query" {
	interface Register {
		defaultError: ProblemError;
	}
}

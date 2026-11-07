import { z } from "zod";

/** HTTP statuses the API can answer with an error body. The server's RPC types are built from this list. */
export const apiErrorStatuses = [400, 401, 403, 404, 409, 422, 429, 500] as const;
export type ApiErrorStatus = (typeof apiErrorStatuses)[number];

/**
 * Machine-readable error codes. Clients branch on `code`; `detail` is for humans.
 * `NETWORK_ERROR` is produced by the client when the request never got a response.
 */
export const errorCodes = [
	"BAD_REQUEST",
	"UNAUTHORIZED",
	"FORBIDDEN",
	"NOT_FOUND",
	"CONFLICT",
	"VALIDATION_FAILED",
	"RATE_LIMITED",
	"INTERNAL_ERROR",
	"NETWORK_ERROR",
] as const;
export type ErrorCode = (typeof errorCodes)[number];

/**
 * RFC 9457 Problem Details body (`application/problem+json`) with two extension members:
 * `code` and, for validation failures, `fieldErrors` keyed by dotted path (e.g. "items.0.price").
 */
export const problemDetails = z.object({
	type: z.string(),
	title: z.string(),
	status: z.int(),
	detail: z.string().optional(),
	instance: z.string().optional(),
	code: z.enum(errorCodes),
	fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
});
export type ProblemDetails = z.infer<typeof problemDetails>;

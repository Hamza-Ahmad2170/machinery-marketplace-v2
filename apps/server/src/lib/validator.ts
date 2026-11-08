import { zValidator } from "@hono/zod-validator";
import type { FieldErrors } from "@repo/validators";
import type { ValidationTargets } from "hono";
import type { z } from "zod";
import { ApiError } from "./errors.js";

function toFieldErrors(issues: readonly z.core.$ZodIssue[]): FieldErrors {
	const fieldErrors: FieldErrors = {};
	for (const issue of issues) {
		// Dotted path for nested fields ("items.0.price"); "root" for errors on the whole object.
		const key = issue.path.map(String).join(".") || "root";
		fieldErrors[key] ??= [];
		fieldErrors[key].push(issue.message);
	}
	return fieldErrors;
}

/**
 * Validates part of the request with a Zod schema from @repo/validators.
 * On failure it throws a 422 ApiError with `fieldErrors`, so every route reports
 * invalid input the same way and no extra error type is added to the RPC types.
 *
 *   .post("/", validator("json", createListingInput), (c) => { const input = c.req.valid("json"); ... })
 */
export const validator = <Schema extends z.ZodType, Target extends keyof ValidationTargets>(
	target: Target,
	schema: Schema,
) =>
	zValidator(target, schema, (result) => {
		if (!result.success) {
			throw ApiError.validation(toFieldErrors(result.error.issues), `Invalid request ${target}`);
		}
	});

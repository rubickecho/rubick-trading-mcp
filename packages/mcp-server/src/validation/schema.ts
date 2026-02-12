import Ajv, { type ValidateFunction } from "ajv";

const ajv = new Ajv({ allErrors: true, strict: false });
const cache = new WeakMap<object, ValidateFunction>();

export function validateSchema(schema: unknown, data: unknown) {
  if (!schema || typeof schema !== "object") {
    return { valid: true as const, errors: undefined };
  }

  let validator = cache.get(schema as object);
  if (!validator) {
    validator = ajv.compile(schema as object);
    cache.set(schema as object, validator);
  }

  const valid = validator(data) as boolean;
  return { valid, errors: validator.errors };
}

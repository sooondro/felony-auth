/**
 * Main Authentication class export.
 */
export { Authentication } from './Authentication'

/**
 * Cache adapter's exports.
 */
export { CacheAdapterInterface } from './cache/CacheAdapterInterface'
export { RedisSession } from './cache/redis/RedisSession'
export { SessionInterface } from './cache/SessionInterface'
export { RedisAdapter } from './cache/redis/RedisAdapter'

/**
 * Error adapter's exports.
 */
export { AuthenticationError } from './error/AuthenticationError'
export { DefaultErrorAdapter } from './error/DefaultErrorAdapter'
export { ErrorAdapterInterface } from './error/ErrorAdapterInterface'
export { ValidationError, ValidationErrors } from './error/ValidationError'

/**
 * Two-factor providers' exports.
 */
export { TwoFactorProviderInterface } from './providers/two-factor/TwoFactorProviderInterface'
export { TOTPTwoFactorProvider } from './providers/two-factor/TOTPTwoFactorProvider'

/**
 * Storage adapter's exports.
 */
export { StorageAdapterInterface } from './storage/StorageAdapterInterface'
export { PostgresAdapter } from './storage/postgres/PostgresAdapter'

/**
 * Validation adapter's exports.
 */
export { ValidationAdapterInterface } from './validation/ValidationAdapterInterface'
export { DefaultValidationAdapter } from './validation/DefaultValidationAdapter'

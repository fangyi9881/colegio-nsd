/**
 * Dummy fetch module to prevent libraries from trying to polyfill window.fetch
 * in the browser environment where it's already defined and read-only.
 */
const fetch = typeof window !== 'undefined' ? window.fetch : undefined;
export default fetch;
export { fetch };

export * from './core/validator.js';
export * from './core/compiler.js';
export { extractClasses } from './integrations/extractor.js';
export { listDefineVariableNames, parseDefineVariables } from './core/preprocessor.js';
export { FSS_BASE_CSS } from './runtime/base-css.js';
export { getFssBaseStyleSheet, createFssShadowStyles, type FssShadowStylesHandle } from './runtime/shadow-styles.js';

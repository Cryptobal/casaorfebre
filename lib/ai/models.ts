/**
 * ÚNICA fuente de verdad para strings de modelo de Anthropic.
 * Nunca hardcodear un modelo fuera de este archivo.
 *
 * Historia: claude-sonnet-4-20250514 fue RETIRADO por Anthropic el
 * 15-jun-2026 y todos los crons de IA fallaron en silencio durante
 * más de un mes. Reemplazo oficial: claude-sonnet-4-6.
 * Ref: https://docs.claude.com/en/docs/about-claude/model-deprecations
 */
export const CLAUDE_SONNET = "claude-sonnet-4-6"; // tareas complejas (blog, curaduría, visión)
export const CLAUDE_HAIKU = "claude-haiku-4-5-20251001"; // tareas de volumen (vigente)

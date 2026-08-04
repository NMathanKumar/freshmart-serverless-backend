# FreshMart Developer & Agent Guidelines

## UI Protection Rules (CRITICAL - PRODUCTION BASELINE)

From this point onward, the Customer Web and Admin Web frontends are restored to their original production baseline. **NO AGENT OR DEVELOPER IS ALLOWED TO REDESIGN, REGENERATE, REPLACE, OR REFACTOR THE UI UNLESS EXPLICITLY INSTRUCTED BY THE USER.**

### Strictly Forbidden:
- Never replace Customer UI.
- Never replace Admin UI.
- Never generate a new design or layout.
- Never install UI templates or framework starter themes.
- Never overwrite routing configurations.
- Never change theme colors or color palettes.
- Never replace Tailwind configuration or CSS tokens.
- Never replace design-system components.
- Never remove existing layouts or navigation structures.

### Explicitly Allowed & Encouraged:
- Bug fixes & exception handling
- Feature additions requested by the user
- Backend integration & service connections
- API wiring via @freshmart/api-sdk
- Role-Based Access Control (RBAC) & Authentication flow maintenance
- Performance optimizations
- Accessibility improvements

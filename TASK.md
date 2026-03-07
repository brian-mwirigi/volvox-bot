# TASK: Multi-role permissions (admin + moderator)

Branch: `feat/multi-role-permissions`
Repo: VolvoxLLC/volvox-bot
Work in: `/home/bill/worktrees/volvox-bot-multi-roles`

## Goal
Allow configuring multiple Discord roles as admin and multiple roles as moderator, instead of a single role each.

## Schema change
- `config.permissions.adminRoleId: string | null` → `config.permissions.adminRoleIds: string[]`
- `config.permissions.moderatorRoleId: string | null` → `config.permissions.moderatorRoleIds: string[]`

## Files to change

### 1. `src/config.json` (or wherever defaults live)
- Find the permissions defaults
- Change `adminRoleId: null` → `adminRoleIds: []`
- Change `moderatorRoleId: null` → `moderatorRoleIds: []`

### 2. `web/src/types/config.ts`
- Line ~191: Change `adminRoleId: string | null` → `adminRoleIds: string[]`
- Line ~192: Change `moderatorRoleId: string | null` → `moderatorRoleIds: string[]`

### 3. `src/utils/permissions.js`
- Line 66: `config.permissions?.adminRoleId` check → check if member has ANY role in `config.permissions?.adminRoleIds ?? []`
  ```js
  const adminRoleIds = config.permissions?.adminRoleIds ?? [];
  if (adminRoleIds.length > 0) {
    return adminRoleIds.some(id => member.roles.cache.has(id));
  }
  ```
- Line 162-169: Same pattern for both admin and moderator checks
- Keep backward compat: if `adminRoleId` (singular) exists in config, treat it as `[adminRoleId]` so old configs still work

### 4. `src/utils/modExempt.js`
- Update to check array: `(config.permissions?.adminRoleIds ?? []).some(id => member.roles.cache.has(id))`
- Same for moderatorRoleIds
- Keep backward compat for old singular field

### 5. `src/modules/moderation.js`
- Lines 589-594: Spread the arrays for protect roles:
  ```js
  ...(protectRoles.includeAdmins ? (config.permissions?.adminRoleIds ?? []) : []),
  ...(protectRoles.includeModerators ? (config.permissions?.moderatorRoleIds ?? []) : []),
  ```

### 6. `web/src/components/dashboard/config-editor.tsx`
- The RoleSelector for admin is currently single-select (wraps value in array, takes `selected[0]`). Change to true multi-select:
  - `selected={draftConfig.permissions?.adminRoleIds ?? []}` (no wrapping)
  - `onChange={(selected) => updatePermissionsField('adminRoleIds', selected)}`
  - Remove `maxSelections={1}` if present
- Same for moderator:
  - `selected={draftConfig.permissions?.moderatorRoleIds ?? []}`
  - `onChange={(selected) => updatePermissionsField('moderatorRoleIds', selected)}`

### 7. Check for any other references to old singular fields
```bash
grep -rn "adminRoleId\b\|moderatorRoleId\b" src/ web/src/ --include="*.js" --include="*.ts" --include="*.tsx"
```
Fix any remaining references.

### 8. Update tests
- `tests/utils/permissions.test.js` — update mocks and assertions to use arrays
- `tests/utils/modExempt.test.js` — same

## Backward compat pattern
In permissions.js and modExempt.js, support old configs that have the singular field:
```js
const adminRoleIds = config.permissions?.adminRoleIds 
  ?? (config.permissions?.adminRoleId ? [config.permissions.adminRoleId] : []);
```

## Rules
- Conventional commits
- Run `pnpm format && pnpm lint && pnpm test` and `pnpm --prefix web lint && pnpm --prefix web typecheck`
- Do NOT push

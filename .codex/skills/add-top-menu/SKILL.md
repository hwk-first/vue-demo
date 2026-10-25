---
name: add-top-menu
description: Add a new top-level sidebar menu (一级菜单) to a Vue 3 + Element Plus admin project from a single keyword, creating the page view, route, sidebar sub-menu, and breadcrumb. Use when the user asks to 新增/添加一级菜单 or 新建菜单, or gives a menu keyword to turn into a working page.
metadata:
  short-description: 新增一级菜单（页面 + 路由 + 侧边栏 + 面包屑）
---

# Add Top-Level Menu

Turn one keyword such as `基础管理` or `报表管理` into a working top-level sidebar menu: page component, route, sidebar entry, and breadcrumb. The result must be reachable and render without errors, not just a menu label.

## Resolve the inputs

- **label** — the top-level menu title, the keyword verbatim.
- **children** — the second-level items. Use them when the user lists them (`报表列表`、`报表导出`, or `报表管理 > 报表列表`). When only a keyword is given, create exactly one child item whose label equals `label`.
- **slug** — lowercase kebab-case ASCII route segment (`device-manage`, `format-convert`). Reuse wording the project already uses. If the keyword has no obvious English equivalent, ask one short question covering both the slug and the child label, then continue; do not invent a pinyin slug.

## Read before editing

Inspect the actual project instead of assuming structure:

- the sidebar/layout component, commonly `src/views/LayoutView.vue`
- the router, commonly `src/router/index.ts`
- one existing view in `src/views/` for page conventions
- `src/main.ts` to see whether UI components are globally registered

Follow what you find. When the project matches the common Vue 3 + Element Plus shell, [references/element-plus-admin.md](references/element-plus-admin.md) has the exact insertion points and snippets.

## Make all of these changes

1. **View** — create `src/views/<PascalName>View.vue` with `<script setup lang="ts">` and a body matching sibling pages (usually an `el-card`). `PascalName` comes from the slug (`report-manage` → `ReportManage`).
2. **Route** — register a child of the authenticated layout route with `path: '<slug>'`, `name: '<slug>'`, and `component: () => import('@/views/<PascalName>View.vue')`. One route per child menu item.
3. **Sidebar** — add an `<el-sub-menu index="<key>">` whose `<template #title>` has an icon plus the label, and one `<el-menu-item index="/<slug>">` per child. Use an icon from the library the project already imports, add it to that import, and avoid an icon already shown on a sibling top-level menu.
4. **Breadcrumb** — extend the layout's breadcrumb logic with a branch for the new route path so new pages show the correct trail, reusing the project's existing breadcrumb shape.
5. **Active menu** — when the new menu has detail sub-routes, extend the active-menu computation so those routes keep the parent item highlighted, following how the project already treats its detail pages.

Do not reorder, relabel, or restyle existing menus.

## Verify

- Run the project's type check and build (`npm run type-check`, `npm run build`) when available and fix anything you introduced.
- When a dev server is practical, load the app and confirm the new menu renders, navigates, and highlights.

Report the menu label, the files changed, and the verification result. If you defaulted the child item to the same name as the top-level menu, say so.

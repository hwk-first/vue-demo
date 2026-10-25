# Element Plus admin insertion points

Concrete snippets from a Vue 3 + Element Plus + vue-router admin shell. Confirm each one against the target project before applying; names and paths may differ.

## Sidebar

In the layout component (commonly `src/views/LayoutView.vue`):

```vue
<el-menu :default-active="activeMenu" router class="sidebar-menu">
  <el-sub-menu index="basic">
    <template #title>
      <el-icon><Grid /></el-icon>
      <span>基础管理</span>
    </template>
    <el-menu-item index="/device-manage">设备管理</el-menu-item>
  </el-sub-menu>
</el-menu>
```

Add a block of the same shape with a new `index` for the new top-level menu; item `index` values are `/`-prefixed and must match router paths exactly. Icons come from `@element-plus/icons-vue` — add the new icon to the existing import line.

## Router

In `src/router/index.ts`, inside the authenticated layout route's `children`:

```ts
{
  path: 'device-manage',
  name: 'device-manage',
  component: () => import('@/views/DeviceManageView.vue'),
}
```

Child paths are relative (no leading slash) and `name` matches the slug. Detail routes take a param, e.g. `path: 'device-edit/:id'`.

## Breadcrumb and active menu

Both usually live in the layout component:

```ts
const activeMenu = computed(() =>
  route.path.startsWith('/device') ? '/device-manage' : route.path,
)

const breadcrumbs = computed<Breadcrumb[]>(() => {
  if (route.path.startsWith('/device')) {
    return [{ label: '基础管理' }, { label: '设备管理', path: '/device-manage' }]
  }
  return [{ label: '基础管理' }]
})
```

Add a branch keyed on the new route prefix, and extend `activeMenu` the same way `/device` is handled when detail routes exist.

## Placeholder view

```vue
<script setup lang="ts"></script>

<template>
  <el-card shadow="never">
    <h2>报表管理</h2>
  </el-card>
</template>
```

Element Plus components are often registered globally in `src/main.ts` (`app.use(ElementPlus, …)`), so only icon imports are needed in the component. Verify this before adding component imports.

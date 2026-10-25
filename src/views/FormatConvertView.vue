<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onBeforeUnmount, h, type VNode } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Connection,
  Delete,
  Expand,
  Fold,
  Search,
  ArrowUp,
  ArrowDown,
} from '@element-plus/icons-vue'
import type { ElTree } from 'element-plus'

interface TreeNode {
  id: string
  label: string
  key: string
  children?: TreeNode[]
}

/** el-tree 节点实例的简化类型 */
interface TreeNodeInstance {
  data: TreeNode
  label: string
  parent: TreeNodeInstance | null
}

const jsonText = ref('')
const treeData = ref<TreeNode[]>([])
const hasResult = ref(false)
const nodePath = ref('')
const filterText = ref('')
const matchIds = ref<string[]>([])
const currentIndex = ref(-1)
const treeVersion = ref(0)
const treeRef = ref<InstanceType<typeof ElTree>>()
const searchInputRef = ref()
const treeWrapRef = ref<HTMLElement>()

let uid = 0
function nextId() {
  return `node-${uid++}`
}

/** 把任意 JSON 值递归转成 el-tree 节点 */
function buildTree(key: string | null, value: unknown): TreeNode {
  if (value === null) {
    return { id: nextId(), label: key ? `${key}: null` : 'null', key: key ?? '' }
  }

  if (typeof value === 'string') {
    return { id: nextId(), label: key ? `${key}: "${value}"` : `"${value}"`, key: key ?? '' }
  }

  if (typeof value !== 'object') {
    return {
      id: nextId(),
      label: key ? `${key}: ${String(value)}` : String(value),
      key: key ?? '',
    }
  }

  if (Array.isArray(value)) {
    const children = value.map((item, i) => buildTree(`[${i}]`, item))
    return { id: nextId(), label: key ?? 'Array', key: key ?? '', children }
  }

  const children = Object.entries(value as Record<string, unknown>).map(([k, v]) => buildTree(k, v))
  return { id: nextId(), label: key ?? 'Object', key: key ?? '', children }
}

/** 点击转换 */
function handleConvert() {
  const text = jsonText.value.trim()
  if (!text) {
    ElMessage.warning('请先填写 JSON 报文')
    return
  }

  try {
    const parsed = JSON.parse(text)
    treeData.value = [buildTree(null, parsed)]
    hasResult.value = true
    nodePath.value = ''
    filterText.value = ''
  } catch (e) {
    treeData.value = []
    hasResult.value = false
    ElMessage.error(`JSON 格式错误：${(e as Error).message}`)
  }
}

/** 清空输入 */
function handleClear() {
  jsonText.value = ''
  treeData.value = []
  hasResult.value = false
  nodePath.value = ''
  filterText.value = ''
}

/** 点击节点：展示从根到该节点的路径 */
function handleNodeClick(data: TreeNode, node: TreeNodeInstance) {
  const parts: string[] = []
  let cur: TreeNodeInstance | null = node
  while (cur) {
    if (cur.data?.key) parts.unshift(cur.data.key)
    cur = cur.parent
  }

  nodePath.value = parts.reduce((acc, p) => {
    if (p.startsWith('[')) return acc + p
    return acc ? `${acc}.${p}` : p
  }, '')
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 根据关键字重新计算匹配节点列表，并跳到第一个匹配 */
function refreshMatches() {
  const keyword = filterText.value.trim().toLowerCase()
  if (!keyword) {
    matchIds.value = []
    currentIndex.value = -1
    treeVersion.value++
    return
  }

  const ids: string[] = []
  const walk = (nodes: TreeNode[]) => {
    for (const n of nodes) {
      if (n.label.toLowerCase().includes(keyword)) ids.push(n.id)
      if (n.children) walk(n.children)
    }
  }
  walk(treeData.value)

  matchIds.value = ids
  currentIndex.value = ids.length ? 0 : -1
  treeVersion.value++
  scrollToMatch()
}

/** 上一个匹配 */
function prevMatch() {
  if (!matchIds.value.length) return
  currentIndex.value = (currentIndex.value - 1 + matchIds.value.length) % matchIds.value.length
  treeVersion.value++
  scrollToMatch()
}

/** 下一个匹配 */
function nextMatch() {
  if (!matchIds.value.length) return
  currentIndex.value = (currentIndex.value + 1) % matchIds.value.length
  treeVersion.value++
  scrollToMatch()
}

/** 滚动到当前匹配节点 */
async function scrollToMatch() {
  await nextTick()
  await nextTick()
  const id = matchIds.value[currentIndex.value]
  if (id == null) return
  const el = treeWrapRef.value?.querySelector(`[data-match-id="${id}"]`)
  ;(el as HTMLElement | null)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
}

// 输入关键字时重新计算匹配
watch(filterText, refreshMatches)

/** 自定义节点内容：关键字高亮 + 当前匹配高亮 */
function renderNode(_h: typeof h, { data }: { data: TreeNode }) {
  const label: string = data.label
  const keyword = filterText.value.trim()
  const isCurrent = data.id === matchIds.value[currentIndex.value]

  let children: Array<string | VNode>
  if (!keyword) {
    children = [label]
  } else {
    const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi')
    children = label
      .split(regex)
      .map((part) =>
        part && part.toLowerCase() === keyword.toLowerCase()
          ? _h('mark', { class: 'hl' }, part)
          : part,
      )
  }

  return _h('span', { class: { 'match-current': isCurrent }, 'data-match-id': data.id }, children)
}

function expandAll() {
  nextTick(() => {
    const map = treeRef.value?.store.nodesMap
    if (map) Object.values(map).forEach((n) => (n.expanded = true))
  })
}

function collapseAll() {
  nextTick(() => {
    const map = treeRef.value?.store.nodesMap
    if (map) Object.values(map).forEach((n) => (n.expanded = false))
  })
}

/** Ctrl+F 聚焦到右侧搜索框，并阻止浏览器默认查找（避免左侧输入框被高亮） */
function onKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
    e.preventDefault()
    searchInputRef.value?.focus()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="format-page">
    <el-card shadow="never" class="tool-card">
      <div class="convert-layout">
        <!-- 左侧：输入框 -->
        <div class="pane">
          <div class="pane-header">
            <span class="pane-title">JSON 报文</span>
            <el-button link type="danger" :icon="Delete" @click="handleClear">清空</el-button>
          </div>
          <div class="pane-body">
            <el-input
              v-model="jsonText"
              type="textarea"
              resize="none"
              placeholder='粘贴 JSON 报文，例如：{"name":"测试平台","version":1}'
              class="json-input"
            />
          </div>
        </div>

        <!-- 中间：转换按钮 -->
        <div class="action-col">
          <el-button type="primary" :icon="Connection" @click="handleConvert"> 转换 </el-button>
        </div>

        <!-- 右侧：树状展示 -->
        <div class="pane">
          <div class="pane-header">
            <span class="pane-title">树状展示</span>
            <div class="header-actions">
              <el-input
                v-if="hasResult"
                ref="searchInputRef"
                v-model="filterText"
                :prefix-icon="Search"
                placeholder="Ctrl+F 搜索字段"
                clearable
                class="search-input"
                @keydown.enter.prevent="nextMatch"
                @keydown.enter.shift.prevent="prevMatch"
              />
              <template v-if="hasResult && matchIds.length">
                <span class="match-count"> {{ currentIndex + 1 }}/{{ matchIds.length }} </span>
                <el-button
                  link
                  type="primary"
                  :icon="ArrowUp"
                  title="上一个 (Shift+Enter)"
                  @click="prevMatch"
                />
                <el-button
                  link
                  type="primary"
                  :icon="ArrowDown"
                  title="下一个 (Enter)"
                  @click="nextMatch"
                />
              </template>
              <template v-if="hasResult">
                <el-button link type="primary" :icon="Expand" @click="expandAll">
                  全部展开
                </el-button>
                <el-button link type="primary" :icon="Fold" @click="collapseAll">
                  全部折叠
                </el-button>
              </template>
            </div>
          </div>

          <div v-if="nodePath" class="path-bar">
            路径：<span class="path-text">{{ nodePath }}</span>
          </div>

          <div ref="treeWrapRef" class="pane-body tree-wrap">
            <el-empty v-if="!hasResult" description="转换结果将在此展示" :image-size="90" />
            <el-tree
              v-else
              ref="treeRef"
              :key="treeVersion"
              :data="treeData"
              node-key="id"
              default-expand-all
              :render-content="renderNode"
              class="result-tree"
              @node-click="handleNodeClick"
            />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.format-page {
  height: 100%;
}

.tool-card {
  height: 100%;
}

.tool-card :deep(.el-card__body) {
  height: 100%;
  box-sizing: border-box;
}

.convert-layout {
  display: flex;
  align-items: stretch;
  gap: 16px;
  height: 100%;
  min-height: 480px;
}

.pane {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.pane-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.search-input {
  width: 180px;
}

.match-count {
  min-width: 48px;
  text-align: center;
  font-size: 13px;
  color: #606266;
}

.pane-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.json-input {
  height: 100%;
}

.json-input :deep(.el-textarea) {
  height: 100%;
}

.json-input :deep(.el-textarea__inner) {
  height: 100%;
  font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
  font-size: 13px;
  line-height: 1.6;
}

.action-col {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  flex-shrink: 0;
}

.path-bar {
  flex-shrink: 0;
  margin-bottom: 8px;
  padding: 6px 10px;
  font-size: 13px;
  color: #606266;
  background: #f4f4f5;
  border-radius: 4px;
  word-break: break-all;
}

.path-text {
  font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
  color: #409eff;
}

.tree-wrap {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px;
  overflow: auto;
  background: #fafbfc;
}

.result-tree {
  background: transparent;
  font-size: 13px;
}

.result-tree :deep(.el-tree-node__label) {
  font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
}

.result-tree :deep(mark.hl) {
  background: #ffe58f;
  color: inherit;
  padding: 0 1px;
  border-radius: 2px;
}

.result-tree :deep(.match-current) {
  background: #ffb400;
  color: #fff;
  padding: 1px 3px;
  border-radius: 3px;
}

.result-tree :deep(.match-current mark.hl) {
  background: transparent;
  color: inherit;
}
</style>

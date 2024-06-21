<script setup>
const nodes = ref([
  {
    key: '0',
    label: 'Documents',
    data: 'Documents Folder',
    icon: '',
    children: [
      {
        key: '0-0',
        label: 'Work',
        data: 'Work Folder',
        icon: '',
        children: [
          {
            key: '0-0-0',
            label: 'Expenses.doc',
            icon: '',
            data: 'Expenses Document'
          },
          { key: '0-0-1', label: 'Resume.doc', icon: '', data: 'Resume Document' }
        ]
      },
      {
        key: '0-1',
        label: 'Home',
        data: 'Home Folder',
        icon: '',
        children: [
          {
            key: '0-1-0',
            label: 'Invoices.txt',
            icon: '',
            data: 'Invoices for this month'
          }
        ]
      }
    ]
  }
])
const selectedKey = ref({})
</script>

<template>
  <div>
    <Tree
      v-model:selectionKeys="selectedKey"
      :value="nodes"
      selectionMode="checkbox"
      filter="true"
      filterMode="strict"
      class="w-full"
    >
      <template #togglericon="{ expanded }"
        ><Icon :name="expanded ? 'solar:folder-open-linear' : 'solar:add-folder-linear'"
      /></template>
      <template #nodeicon="item"
        ><Icon
          v-if="!item.node.children"
          :name="item.node.children ? '' : 'solar:file-linear'"
          class="mr-1"
      /></template>
      <template #default="item" class="flex flex-row">
        <span class="flex-1">{{ item.node.label }}</span>

        <span class="ml-1">1.23MB</span>
      </template>
    </Tree>
    <p>{{ selectedKey }}</p>
  </div>
</template>

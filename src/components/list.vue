<script setup>
import { ref, onMounted } from 'vue';
import { useCache } from '../composables/useCache.js';
import { SpreadsheetDataGViz } from '../spreadsheet/index.js';

const items = ref([]);
const { doCache } = useCache();

const sheetLoader = new SpreadsheetDataGViz({
  spreadsheetId: import.meta.env.VITE_SPREADSHEET_ID,
  sheetName: import.meta.env.VITE_SHEET_NAME || 'items',
  query: null,
});

onMounted(() => {
  doCache('sheet-items', items, () => sheetLoader.load());
});
</script>

<template>
  <div class="text-center">
    <h1 class="text-4xl font-bold mb-4">List of Items</h1>
    <div v-for="item in items" :key="item.id" class="flex flex-col gap-1 max-w-md mx-auto mb-4">
      <h2 class="text-2xl font-bold capitalize">{{ item.name }}</h2>
      <p class="text-gray-500">{{ item.description }}</p>
    </div>
  </div>
</template>

<style scoped>

</style>

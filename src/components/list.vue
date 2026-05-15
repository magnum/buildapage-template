<script setup>
import { ref, onMounted } from 'vue';
import utils from '../utils.js';
import { useCache } from '../composables/useCache.js';

const items = ref([]);
const { doCache } = useCache();

async function loadItemsFromSheet() {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const spreadsheetId = import.meta.env.VITE_SPREADSHEET_ID;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/items!A1:D10?key=${apiKey}`;
  const response = await fetch(url);
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error?.message ?? 'Sheets request failed');
  }
  const values = json.values;
  if (!values?.length) return [];
  const keys = values.shift();
  return values.map((row) =>
    Object.fromEntries(keys.map((k, i) => [k, row[i] ?? '']))
  );
}

onMounted(() => {
  doCache('sheet-items', items, loadItemsFromSheet);
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
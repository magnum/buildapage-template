<script setup>
import { ref, onMounted } from 'vue';
// read items from google sheet api
const items = ref([]);

const fetchItems = async () => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const spreadsheetId = import.meta.env.VITE_SPREADSHEET_ID;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/items!A1:D10?key=${apiKey}`;
  const response = await fetch(url);
  const json = await response.json()
  const values = json.values;
  const keys = values.shift();
  items.value = values.map(value => Object.fromEntries(keys.map((k, i) => [k,value[i]])))
  console.log(items.value);
};

onMounted(() => {
  fetchItems();
});
</script>

<template>
  <div class="text-center">
    <h1 class="text-4xl font-bold mb-4">List of Items</h1>
    <div v-for="item in items" :key="item.id" class="flex flex-col gap-1 max-w-md mx-auto mb-4">
      <h2 class="text-2xl font-bold">{{ item.name }}</h2>
      <p class="text-gray-500">{{ item.description }}</p>
    </div>
  </div>
</template>

<style scoped>

</style>
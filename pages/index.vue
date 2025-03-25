<script setup lang="ts">
// Clients : Common, Customer, FCExchange, Finance, EntityManagement, Compliance, Utilities, Remittance, Accounting, SystemSettings
const clients = [
  "Common",
  "Customer",
  "FCExchange",
  "Finance",
  "EntityManagement",
  "Compliance",
  "Utilities",
  "Remittance",
  "Accounting",
  "SystemSettings",
];
const selectedClient = ref();
const loading = ref(false);
const generate = async () => {
  loading.value = true;
  const { data } = await useFetch(
    "/api/generate?module=" + selectedClient.value
  );
  console.log(data);
  const dataValue = data.value as { archivePath?: string };
  if (dataValue.archivePath) {
    const response = await fetch("generated.zip");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated.zip";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
  loading.value = false;
};
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen gap-5">
    <h1 class="text-4xl font-bold">Hello World</h1>
    <Select
      class="w-52"
      :items="clients"
      label="Select Module"
      v-model="selectedClient"
    />
    <UButton class="w-52" block @click="generate" :disabled="loading">
      <span v-if="loading">Loading...</span>
      <span v-else>Generate</span>
    </UButton>
  </div>
</template>

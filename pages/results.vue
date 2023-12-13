<script lang="ts" setup>
defineProps({ weekVotes: Array as any });
</script>

<template>
  <div class="flex flex-wrap gap-6 mt-10">
    <div
      v-for="d in weekVotes"
      :key="d.id"
      class="w-[300px] rounded-lg flex flex-col shadow-md"
    >
      <img
        class="w-full h-full rounded-lg"
        referrerpolicy="no-referrer"
        alt="Username pic"
        :src="d.yt_thumb"
      />

      <div class="p-3 flex flex-col gap-2 rounded-lg">
        <span class="text-lg">{{ d.yt_username }}</span>
        <span class="mt-2 font-bold text-2xl">{{
          `${d.count} ${d.count === 1 ? "vote" : "votes"}`
        }}</span>
      </div>
    </div>
  </div>
</template>

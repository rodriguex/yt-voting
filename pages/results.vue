<script lang="ts" setup>
defineProps({ weekVotes: Array as any });
</script>

<template>
  <div class="flex flex-wrap gap-6 mt-10">
    <div
      v-for="d in weekVotes"
      :key="d.id"
      class="w-[300px] rounded-md flex flex-col shadow-md"
    >
      <div class="flex flex-col gap-2">
        <span class="p-4 font-bold text-lg">{{ d.yt_username }}</span>
        <img
          class="w-full h-full"
          referrerpolicy="no-referrer"
          :src="d.yt_thumb"
        />
      </div>

      <span class="p-4 mt-5 font-bold text-2xl">{{
        `${d.count} ${d.count === 1 ? "vote" : "votes"}`
      }}</span>
    </div>
  </div>
</template>

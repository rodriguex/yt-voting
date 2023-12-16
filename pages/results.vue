<script lang="ts" setup>
import { setScrollBody } from "~/helpers/functions";

defineProps({ weekVotes: Array as any, activeWeek: { type: Object } });
const showModal = ref(false);

onMounted(() => {
  let mainDiv = document.getElementById("__nuxt");
  if (mainDiv) {
    mainDiv.scrollTop = 0;
  }
});

function setModal(value: boolean) {
  showModal.value = value;

  if (!value) {
    setScrollBody("add");
  } else {
    setScrollBody("remove");
  }
}
</script>

<template>
  <div>
    <div class="flex flex-col w-full max-w-6xl m-auto">
      <h1
        class="mt-12 pb-4 font-gloria font-bold w-fit m-auto border-double border-[#40c7a3] border-b-4 text-3xl"
      >
        Results of the current week
      </h1>
      <span
        class="w-fit font-bold underline mt-10 cursor-pointer"
        @click="setModal(true)"
        >When this week ends?</span
      >
      <div class="flex flex-wrap gap-20 my-20 items-center">
        <div
          v-for="(d, index) in weekVotes"
          :key="d.id"
          class="flex items-center w-full max-w-[520px] h-[400px] shadow px-10 py-5 justify-center"
        >
          <h2
            class="font-bold text-[150px] text-gray-900"
            :class="[index === 0 ? 'w-[65px]' : 'w-[100px]']"
          >
            {{ index + 1 }}
          </h2>
          <div class="flex flex-col">
            <span
              v-if="index === 0"
              class="italic font-bold text-xl text-gray-600 font-gloria mb-3"
              >best youtuber of the week!</span
            >
            <img
              class="w-full max-w-[350px] h-full rounded-lg"
              referrerpolicy="no-referrer"
              alt="Username pic"
              :src="d.yt_thumb"
            />
            <div class="p-3 flex flex-col gap-2 rounded-lg">
              <span class="font-gloria text-lg">{{ d.yt_username }}</span>
              <span class="mt-2 font-bold text-2xl">{{
                `${d.count} ${d.count === 1 ? "vote" : "votes"}`
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <CountdownModal
      v-if="showModal"
      :show="showModal"
      :setShow="setModal"
      :activeWeek="activeWeek"
    />
  </div>
</template>

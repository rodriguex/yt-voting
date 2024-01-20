<script lang="ts" setup>
useSeoMeta({
  title: "YT Voting",
  ogTitle: "YT Voting",
  description: "A site to vote in the best youtubers of the week!",
  ogDescription: "A site to vote in the best youtubers of the week!",
  robots: "follow, index",
});

import { setScrollBody } from "./../helpers/functions";

const config = useRuntimeConfig();

const showModal = ref(false);
const mainDiv = ref<any>(null);

const allStore = useAllStore();
const {
  searchInput,
  searchResults,
  vote,
  user,
  activeWeek,
  alreadyVoted,
  isLoading,
  isCountdownOver,
} = storeToRefs(allStore);

onMounted(async () => {
  if (!user.value) return;

  isLoading.value = true;
  if (!activeWeek.value) {
    await allStore.getActiveWeek();
  }

  if (alreadyVoted.value === true) {
    navigateTo("/alreadyVoted");
  } else if (alreadyVoted.value === null) {
    let userVotes = await allStore.getUserVotes(
      activeWeek.value.id,
      user.value.id
    );
    if (user.value.email !== "gustardn@gmail.com" && userVotes > 0) {
      alreadyVoted.value = true;
      navigateTo("/alreadyVoted");
    } else {
      alreadyVoted.value = false;
    }
  }

  isLoading.value = false;
});

watch(searchInput, () => {
  if (!searchInput.value) {
    searchResults.value = [];
  }
});

watchEffect(() => {
  if (isCountdownOver.value) {
    showModal.value = false;
  }
});

function voteInChannel(channel: any) {
  vote.value = channel;
  showModal.value = true;
  setScrollBody("remove");
}

function setModal(displayModal: boolean) {
  showModal.value = displayModal;
  setScrollBody("add");
}

function confirmVote() {
  showModal.value = false;
  setScrollBody("add");
  allStore.addVote();
}

async function getData() {
  if (searchInput.value) {
    isLoading.value = true;
    let req: any = await $fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${searchInput.value}&key=${config.public.GOOGLE_API_KEY}`
    );
    searchResults.value = req.items;
    isLoading.value = false;
  }
}
</script>

<template>
  <div>
    <div class="px-4 xl:px-0 flex flex-col w-full max-w-6xl m-auto pb-20">
      <h1 class="mt-12 text-3xl font-gloria">Search your favorite youtuber!</h1>
      <form class="mt-5" @submit.prevent="getData">
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-5">
            <input
              id="input"
              class="shadow text-gray-500 w-full focus:outline-none p-7 rounded-lg text-base md:text-xl"
              v-model="searchInput"
              placeholder="My favorite youtube channel..."
            />
            <button
              class="hidden hover:fill-[white] md:flex items-center justify-center gap-3 border-2 border-black shadow bg-white hover:bg-black hover:text-white p-4 w-[180px] text-xl rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="18"
                width="18"
                viewBox="0 0 512 512"
              >
                <path
                  d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
                />
              </svg>
              <span>Search</span>
            </button>
          </div>
        </div>
      </form>

      <div
        v-if="searchResults.length"
        class="mt-10 flex flex-wrap gap-5"
        ref="mainDiv"
      >
        <div
          v-for="result in searchResults"
          class="flex bg-white flex-col w-full h-auto sm:max-w-[305px] lg:h-[400px] items-center gap-2 relative rounded-lg shadow"
          :key="result?.snippet?.channelId"
        >
          <img
            referrerpolicy="no-referrer"
            alt="Youtuber picture"
            class="mt-5 w-[160px] rounded-full"
            :src="result?.snippet?.thumbnails?.high?.url"
          />

          <div class="p-3 flex flex-col gap-3">
            <span
              class="h-[50px] overflow-hidden line-clamp-2 text-center text-xl text-black"
              >{{ result?.snippet?.channelTitle }}</span
            >
          </div>

          <NuxtLink
            :to="`channels/${result?.id?.channelId}`"
            class="cursor-pointer flex items-center gap-3 justify-center fill-white text-center crazyBg text-white border-black p-2 w-[80%] rounded-lg text-xl lg:absolute lg:bottom-[74px] mb-1 lg:mb-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="16"
              width="14"
              viewBox="0 0 448 512"
            >
              <path
                d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464H398.7c-8.9-63.3-63.3-112-129-112H178.3c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3z"
              />
            </svg>
            <span>See Profile</span>
          </NuxtLink>

          <button
            class="cursor-pointer flex items-center gap-3 justify-center border hover:bg-black hover:text-white border-black p-2 w-[80%] hover:fill-white rounded-lg text-xl text-black lg:absolute lg:bottom-4 mb-5 lg:mb-0"
            @click="voteInChannel(result)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20"
              width="20"
              viewBox="0 0 512 512"
            >
              <path
                d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
              />
            </svg>
            <span>Vote</span>
          </button>
        </div>
      </div>
    </div>

    <ConfirmVoteModal
      v-if="showModal"
      :show="showModal"
      :channelName="vote.snippet.channelTitle"
      :channelPic="vote.snippet.thumbnails.high.url"
      :setShow="setModal"
      @confirmVote="confirmVote"
    />
  </div>
</template>

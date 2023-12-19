<script lang="ts" setup>
import { channelsList } from "./../mock";
import { setScrollBody } from "./../helpers/functions";

const props = defineProps({
  user: Object as any,
  activeWeek: Object as any,
  isWeekActive: Boolean,
  alreadyVoted: Boolean,
  isUserSignedIn: Boolean,
});

const emits = defineEmits(["setAlreadyVoted"]);
const supabase: any = useSupabaseClient();

const input = ref("");
const searchResults: any = ref([]);
const vote: any = ref(null);
const showModal = ref(false);
const loadingState = ref(false);

watch(input, () => {
  if (!input.value) {
    searchResults.value = [];
  }
});

function addOrRemoveChannel(channel: any) {
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
  addVote();
}

async function getData() {
  if (input.value) {
    loadingState.value = true;
    // let req: any = await $fetch(
    //   `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${input.value}&key=${config.public.GOOGLE_KEY}`
    // );
    // searchResults.value = req.items;
    setTimeout(() => {
      searchResults.value = channelsList;
      loadingState.value = false;
    }, 400);
  }
}

async function addVote() {
  let data: any = [];

  data.push({
    user_id: props.user.id,
    week_id: props.activeWeek.id,
    yt_username: vote.value.snippet.channelTitle,
    yt_thumb: vote.value.snippet.thumbnails.default.url,
  });

  loadingState.value = true;
  let insert = await supabase.from("votes").insert(data).select();
  if (insert.status === 201) {
    emits("setAlreadyVoted", true);
  }
  loadingState.value = false;

  navigateTo("/results");
}
</script>

<template>
  <div class="h-full">
    <loading :show="loadingState" />

    <login v-if="!user" />
    <div v-else-if="!alreadyVoted && isWeekActive">
      <div class="flex flex-col w-full max-w-6xl m-auto pb-20">
        <h1 class="mt-12 text-3xl font-gloria">
          Search your favorite youtuber!
        </h1>
        <form class="mt-5" @submit.prevent="getData">
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-5">
              <input
                id="input"
                class="font-bold shadow text-gray-500 w-full focus:outline-none p-7 rounded-lg text-2xl"
                v-model="input"
                placeholder="My favorite youtube channel..."
              />
              <button
                class="crazyBg text-white shadow p-6 w-[200px] text-xl rounded-lg font-bold"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        <div v-if="searchResults.length" class="mt-10 flex flex-wrap gap-5">
          <div
            v-for="result in searchResults"
            class="flex bg-white flex-col w-full max-w-[305px] h-[370px] items-center gap-2 relative rounded-lg shadow"
            :key="result?.id?.channelId"
          >
            <img
              referrerpolicy="no-referrer"
              alt="Youtuber picture"
              class="rounded-lg"
              :src="result?.snippet?.thumbnails?.default?.url"
            />

            <div class="p-3 flex flex-col gap-3">
              <span class="font-bold text-xl text-black">{{
                result?.snippet?.channelTitle
              }}</span>
            </div>

            <button
              class="cursor-pointer border-2 border-black p-2 font-bold w-[80%] rounded-lg text-xl text-black absolute bottom-7"
              @click="addOrRemoveChannel(result)"
            >
              Vote
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- <div
      v-else-if="alreadyVoted"
      class="w-full h-full flex items-center crazyBg justify-center"
    >
      <div class="w-full max-w-4xl flex items-end gap-7">
        <img src="resultsIcon.png" alt="Results Icon" class="w-56" />
        <h1 class="text-6xl text-white">
          You already voted this week. Click
          <NuxtLink to="/results"
            ><span class="font-gloria font-bold text-[#40c7a3] underline"
              >here</span
            ></NuxtLink
          >
          to see the results.
        </h1>
      </div>
    </div> -->

    <ConfirmVoteModal
      v-if="showModal"
      :show="showModal"
      :channelName="vote.snippet.channelTitle"
      :setShow="setModal"
      @confirmVote="confirmVote"
    />
  </div>
</template>

<style>
.crazyBg {
  background-image: linear-gradient(45deg, #274c37, #00316f);
}
</style>

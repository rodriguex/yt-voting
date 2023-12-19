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

async function loginWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: "google",
  });
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

    <div v-if="!isUserSignedIn" class="w-full h-full flex">
      <div
        class="bg-[url('beast.jpg')] w-[45%] bg-cover bg-center bg-no-repeat"
      ></div>
      <div class="text-white crazyBg flex flex-col items-center justify-center">
        <h2 class="font-gloria w-[70%] text-center text-6xl">
          Vote for the best youtuber of the week!
        </h2>
        <button
          v-if="!user"
          class="font-bold flex items-center gap-2 text-2xl font-dmSans mt-16 border-2 p-5 rounded-lg"
          @click="loginWithGoogle"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="35"
            height="35"
            viewBox="0 0 48 48"
          >
            <path
              fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917"
            />
            <path
              fill="#FF3D00"
              d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44"
            />
            <path
              fill="#1976D2"
              d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917"
            />
          </svg>
          <span>Login with Google</span>
        </button>
      </div>
    </div>

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

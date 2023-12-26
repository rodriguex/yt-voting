<script lang="ts" setup>
import { channelsList } from "./../mock";
import { setScrollBody } from "./../helpers/functions";

const supabase: any = useSupabaseClient();

const input = ref("");
const searchResults: any = ref([]);
const vote: any = ref(null);
const showModal = ref(false);
const mainDiv = ref<any>(null);

const allStore = useAllStore();
const { user, activeWeek, alreadyVoted, isLoading } = storeToRefs(allStore);

onMounted(async () => {
  if (!user.value) return;

  isLoading.value = true;
  if (!activeWeek.value) {
    await allStore.getActiveWeek();
  }

  if (alreadyVoted.value === true) {
    // navigateTo("/alreadyVoted");
  } else if (alreadyVoted.value === null) {
    let userVotes = await getUserVotes(activeWeek.value.id, user.value.id);
    if (userVotes > 0) {
      alreadyVoted.value = true;
      // navigateTo("/alreadyVoted");
    }
  }

  isLoading.value = false;
});

watch(input, () => {
  if (!input.value) {
    searchResults.value = [];
  }
});

async function getUserVotes(weekId: number, userId: any) {
  let userVotes: any = await supabase
    .from("votes")
    .select("*")
    .eq("week_id", weekId)
    .eq("user_id", userId);

  return userVotes.data.length ? userVotes.data.length : 0;
}

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
    isLoading.value = true;
    // let req: any = await $fetch(
    //   `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${input.value}&key=${config.public.GOOGLE_KEY}`
    // );
    // searchResults.value = req.items;
    setTimeout(() => {
      searchResults.value = channelsList;
      isLoading.value = false;
    }, 400);
  }
}

async function addVote() {
  let data: any = [];

  data.push({
    user_id: user.value.id,
    week_id: activeWeek.value.id,
    yt_username: vote.value.snippet.channelTitle,
    yt_thumb: vote.value.snippet.thumbnails.default.url,
  });

  isLoading.value = true;
  let insert = await supabase.from("votes").insert(data).select();
  if (insert.status === 201) {
    alreadyVoted.value = true;
  }

  isLoading.value = false;
  navigateTo("/results");
}
</script>

<template>
  <div>
    <div class="flex flex-col w-full max-w-6xl m-auto pb-20">
      <h1 class="mt-12 text-3xl font-gloria">Search your favorite youtuber!</h1>
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

      <div
        v-if="searchResults.length"
        class="mt-10 flex flex-wrap gap-5"
        ref="mainDiv"
      >
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

    <ConfirmVoteModal
      v-if="showModal"
      :show="showModal"
      :channelName="vote.snippet.channelTitle"
      :setShow="setModal"
      @confirmVote="confirmVote"
    />
  </div>
</template>

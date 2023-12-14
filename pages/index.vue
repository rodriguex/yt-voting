<script lang="ts" setup>
import { channelsList } from "./../mock";

const props = defineProps({
  user: Object as any,
  activeWeek: Object as any,
  nextActiveWeek: Object as any,
  isWeekActive: Boolean,
  alreadyVoted: Boolean,
  isUserSignedIn: Boolean,
});

const emits = defineEmits(["setAlreadyVoted"]);
const supabase: any = useSupabaseClient();

const input = ref("");
const searchResults: any = ref([]);
const choosenChannels: any = ref([]);

watch(input, () => {
  if (!input.value) {
    searchResults.value = [];
  }
});

function isInList(id: number) {
  return (
    choosenChannels.value.findIndex(
      (channel: any) => channel.id.channelId === id
    ) !== -1
  );
}

async function loginWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: "google",
  });
}

function addOrRemoveChannel(channel: any) {
  let index = choosenChannels.value.findIndex(
    (result: any) => result.id.channelId === channel.id.channelId
  );

  if (index !== -1) {
    choosenChannels.value.splice(index, 1);
  } else if (choosenChannels.value.length < 5) {
    choosenChannels.value = [...choosenChannels.value, channel];
  }
}

async function logout() {
  await supabase.auth.signOut();
}

async function getData() {
  if (input.value) {
    // let req: any = await $fetch(
    //   `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${input.value}&key=${config.public.GOOGLE_KEY}`
    // );
    // searchResults.value = req.items;
    setTimeout(() => {
      searchResults.value = channelsList;
    }, 400);
  }
}

async function vote() {
  let data: any = [];

  choosenChannels.value.forEach((choosen: any) => {
    data.push({
      user_id: props.user.id,
      week_id: props.activeWeek.id,
      yt_username: choosen.snippet.channelTitle,
      yt_thumb: choosen.snippet.thumbnails.default.url,
    });
  });

  let insert = await supabase.from("votes").insert(data).select();
  if (insert.status === 201) {
    emits("setAlreadyVoted", true);
  }
}
</script>

<template>
  <div class="h-full">
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
          <img class="w-10" src="googleLogo.png" alt="" />
          <span>Login with Google</span>
        </button>
      </div>
    </div>

    <div v-else-if="!alreadyVoted && isWeekActive">
      <div class="flex flex-col w-full max-w-5xl m-auto pb-20">
        <form class="mt-8" @submit.prevent="getData">
          <div class="flex flex-col gap-2">
            <span
              class="cursor-pointer font-bold mb-5 text-gray-500"
              @click="logout"
              >Logout</span
            >
            <label
              for="input"
              class="border-b-4 pb-4 w-fit border-double border-[#40c7a3] text-3xl mb-7 font-gloria"
              >Find your favorite youtuber here and leave your vote!</label
            >
            <div class="flex items-center gap-5">
              <input
                id="input"
                class="shadow placeholder:font-gloria w-full focus:outline-none p-7 rounded-lg text-2xl"
                v-model="input"
                placeholder="Mr.Beast..."
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
            class="flex bg-white flex-col w-full max-w-[320px] h-[370px] items-center gap-2 relative rounded-lg shadow"
            :key="result?.id?.channelId"
            @click="addOrRemoveChannel(result)"
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
              class="cursor-pointer border-2 border-black p-2 font-bold w-[90%] rounded-lg text-xl text-black absolute bottom-5"
            >
              Vote
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-3 w-full max-w-4xl m-auto">
        <span v-if="choosenChannels.length" class="mt-5">My voting list</span>

        <div
          v-for="result in choosenChannels"
          class="w-full flex justify-between items-center gap-4 shadow p-4 rounded"
          :key="result.id.channelId"
        >
          <span class="text-xl">{{ result.snippet.channelTitle }}</span>
          <span
            class="cursor-pointer text-red-600"
            @click="addOrRemoveChannel(result)"
            >Remove</span
          >
        </div>

        <button
          v-if="choosenChannels.length === 5 && user"
          class="cursor-pointer shadow base shadow-black p-5 mt-5 font-bold text-xl bg-black w-[250px] rounded-lg"
          @click="vote"
        >
          Vote
        </button>

        <span
          v-if="choosenChannels.length === 5"
          class="mt-4 text-lg font-bold"
        >
          You just can add 5 channels at max
        </span>
      </div>
    </div>

    <h2
      v-else-if="alreadyVoted && isWeekActive"
      class="w-full flex items-center justify-center mb-5 font-bold text-4xl"
      style="height: calc(100vh - 100px)"
    >
      <Countdown
        message="Countdown for the end of this voting week:"
        :endCountdown="new Date(activeWeek.ending)"
      />
    </h2>

    <h2
      v-else-if="!isWeekActive && nextActiveWeek"
      class="w-full flex items-center justify-center font-bold text-5xl"
      style="height: calc(100vh - 100px)"
    >
      <Countdown
        message="Countdown for the next voting week:"
        :endCountdown="new Date(nextActiveWeek.beginning)"
      />
    </h2>
  </div>
</template>

<style scoped>
.crazyBg {
  background-image: linear-gradient(45deg, #274c37, #00316f);
}
</style>

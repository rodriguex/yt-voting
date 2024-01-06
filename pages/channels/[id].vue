<script lang="ts" setup>
import { decodeHtml, formatDate, setScrollBody } from "~/helpers/functions";

const config = useRuntimeConfig();
const id = useRoute().params.id;
const supabase = useSupabaseClient();

const channelData = ref<any>(null);
const channelVideos = ref<any>([]);
const channelHistory = ref<any>(null);

const weekList = ref<any>([]);
const weekInput = ref<any>(null);
const showMoreText = ref(false);

const showConfirmModal = ref(false);
const showVideoModal = ref(false);
const currentVideoUrl = ref("");

const allStore = useAllStore();
const { user, vote, activeWeek, isLoading, alreadyVoted } =
  storeToRefs(allStore);

onMounted(async () => {
  let mainDiv = document.getElementById("__nuxt");
  if (mainDiv) {
    mainDiv.scrollTop = 0;
  }

  isLoading.value = true;
  try {
    if (!activeWeek.value) {
      await allStore.getActiveWeek();
    }

    if (alreadyVoted.value === null) {
      let userVotes = await allStore.getUserVotes(
        activeWeek.value.id,
        user.value.id
      );
      if (userVotes > 0) {
        alreadyVoted.value = true;
      }
    }
    await getWeeks();
    await getChannelData();
    await getChannelStats();
    await getChannelVideos();
    await getChannelVotes();
  } catch (err) {
    return err;
  }
  isLoading.value = false;
});

async function getWeeks() {
  try {
    let req: any = await supabase
      .from("weeks")
      .select("*")
      .lte("beginning", activeWeek.value.beginning)
      .order("id", { ascending: false });
    weekList.value = req.data;
    weekInput.value = req.data[0];
  } catch (err) {
    return err;
  }
}

async function getChannelData() {
  try {
    let req: any = await $fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${id}&key=${config.public.GOOGLE_API_KEY}`
    );
    if (req.items.length) {
      channelData.value = req.items[0].snippet;
    }
  } catch (err) {
    return err;
  }
}

async function getChannelStats() {
  try {
    let req: any = await $fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${id}&key=${config.public.GOOGLE_API_KEY}`
    );
    if (req.items.length) {
      channelData.value.stats = req.items[0].statistics;
    }
  } catch (err) {
    return err;
  }
}

async function getChannelVideos() {
  try {
    let req: any = await $fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${config.public.GOOGLE_API_KEY}&channelId=${id}&part=snippet,id&order=date&maxResults=6&type=video`
    );
    if (req.items.length) {
      channelVideos.value = req.items;
    }
  } catch (err) {
    return err;
  }
}

async function getChannelVotes() {
  try {
    let req: any = await supabase
      .from("votes")
      .select("*")
      .eq("week_id", activeWeek.value.id);
    if (req.data.length) {
      channelHistory.value = sortVotes(req.data);
      channelHistory.value = sortChannelsPosition(channelHistory.value);
      channelHistory.value = channelHistory.value.filter(
        (channel: any) => channel.yt_id === id
      )[0];
    }
  } catch (err) {
    return err;
  }
}

function sortVotes(votes: any) {
  let results: any = [];

  votes.forEach((vote: any) => {
    let index = results.findIndex((result: any) => result.yt_id === vote.yt_id);

    if (index === -1) {
      results = [
        ...results,
        {
          yt_id: vote.yt_id,
          yt_username: vote.yt_username,
          yt_thumb: vote.yt_thumb,
          count: 1,
        },
      ];
    } else {
      results[index] = {
        ...results[index],
        count: results[index].count + 1,
      };
    }
  });

  return results.sort((a: any, b: any) => b.count - a.count);
}

function sortChannelsPosition(votesArray: any) {
  if (votesArray.length) {
    let arr: any = [];
    let order: any = [];

    votesArray.forEach((channel: any) => {
      if (!arr.includes(channel.count)) {
        arr.push(channel.count);
      }
    });

    votesArray.forEach((channel: any) => {
      arr.forEach((vote: any, voteIndex: number) => {
        if (channel.count === vote) {
          order.push({
            yt_id: channel.yt_id,
            yt_username: channel.yt_username,
            yt_thumb: channel.yt_thumb,
            count: channel.count,
            position: voteIndex + 1,
          });
        }
      });
    });

    return order;
  }
}

async function getChannelPosition() {
  try {
    let req: any = await supabase
      .from("votes")
      .select("*")
      .eq("week_id", weekInput.value.id);
    let data: any = sortVotes(req.data);
    if (data.length) {
      data = sortChannelsPosition(data);
      data = data.filter((channel: any) => channel.yt_id === id);
      if (data) {
        channelHistory.value = data[0];
      } else {
        channelHistory.value = null;
      }
    } else {
      channelHistory.value = null;
    }
  } catch (err) {
    return err;
  }
}

function formatNumbers(value: number) {
  return new Intl.NumberFormat().format(value);
}

function setupModal(video: any) {
  currentVideoUrl.value = video.id.videoId;
  showVideoModal.value = true;
  setScrollBody("remove");
}

function setVideoModal(value: boolean) {
  showVideoModal.value = value;
  setScrollBody("add");
}

function setConfirmModal(value: boolean) {
  showConfirmModal.value = value;
  setScrollBody("add");
}

function voteInChannel() {
  vote.value = {
    id: {
      channelId: id,
    },
    snippet: {
      channelTitle: channelData.value.title,
      thumbnails: { high: { url: channelData.value.thumbnails.high.url } },
    },
  };
  showConfirmModal.value = true;
  setScrollBody("remove");
}

function confirmVote() {
  showConfirmModal.value = false;
  setScrollBody("add");
  allStore.addVote();
}
</script>

<template>
  <ClientOnly>
    <div
      v-if="channelData && !isLoading"
      class="px-4 xl:px-0 flex flex-col w-full max-w-6xl m-auto pb-20"
    >
      <div class="mt-10">
        <h1 class="font-bold text-center lg:text-start text-5xl">
          {{ channelData.title }}
        </h1>
        <div
          class="mt-10 flex flex-col lg:flex-row border bg-white border-gray-200 w-full sm:w-[85%] sm:mx-auto lg:mx-0 lg:w-full rounded-lg"
        >
          <div
            class="flex-col gap-2 pb-8 border-b-2 lg:pb-0 lg:border-b-none lg:border-r-2 border-gray-100 flex items-center justify-center px-8"
          >
            <button
              v-if="!alreadyVoted"
              class="mt-10 lg:mb-6 cursor-pointer flex items-center gap-3 justify-center border hover:bg-black hover:text-white border-black p-2 w-[60%] max-w-[250px] hover:fill-white rounded-lg text-xl text-black"
              @click="voteInChannel"
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
            <img
              :src="channelData.thumbnails.high.url"
              alt="Channel picture"
              class="mt-10 lg:mt-0 w-[250px] h-[250px] self-center rounded-full"
              referrerpolicy="no-referrer"
            />
          </div>
          <div
            class="mt-8 lg:mt-0 flex flex-col gap-3 justify-center text-lg px-10 py-6"
          >
            <div class="flex flex-col gap-1">
              <span class="font-bold">Description</span>
              <span
                class="max-w-[600px]"
                :class="[
                  showMoreText
                    ? 'line-clamp-none overflow-auto'
                    : 'line-clamp-2 overflow-hidden',
                ]"
                @click="showMoreText = !showMoreText"
                >{{ decodeHtml(channelData.description) }}</span
              >
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-bold">Subscribers</span>
              <span>{{
                formatNumbers(channelData.stats.subscriberCount)
              }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-bold">Total Videos</span>
              <span>{{ formatNumbers(channelData.stats.videoCount) }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-bold">Total views</span>
              <span>{{ formatNumbers(channelData.stats.viewCount) }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-bold">Youtube url</span>
              <a
                class="underline text-blue-700"
                target="_blank"
                :href="`http://www.youtube.com/${channelData.customUrl}`"
                >{{ `youtube.com/${channelData.customUrl}` }}</a
              >
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-bold">Created at</span>
              <span>{{ `${formatDate(channelData.publishedAt)}` }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        class="mt-16 px-10 w-full sm:w-[85%] lg:w-full bg-white border border-gray-200 py-8 rounded-lg mx-auto lg:mx-0"
      >
        <h2 class="font-bold text-5xl text-center lg:text-start">
          Latest Videos
        </h2>
        <div
          class="mt-10 flex justify-center lg:justify-normal flex-wrap gap-8"
        >
          <div
            v-for="(video, index) in channelVideos"
            class="flex flex-col h-[350px] text-lg gap-3 shadow rounded-lg relative cursor-pointer"
            :key="index"
            @click="setupModal(video)"
          >
            <div
              class="relative w-full md:w-[480px] rounded-t-lg h-[204px]"
              :style="`background: url('${video.snippet.thumbnails.high.url}') center no-repeat`"
            ></div>
            <div
              class="absolute top-0 w-full h-[204px] flex items-center justify-center fill-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="40"
                width="40"
                viewBox="0 0 512 512"
              >
                <path
                  d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9V344c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z"
                />
              </svg>
            </div>
            <div class="flex flex-col gap-1 px-3 pb-4">
              <span
                class="max-w-[400px] font-bold text-xl line-clamp-2 overflow-hidden"
                >{{ decodeHtml(video.snippet.title) }}</span
              >
              <span class="mt-3 absolute bottom-5"
                >Published at:
                {{ `${formatDate(video.snippet.publishedAt)}` }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <div
        class="mt-14 w-full sm:w-[85%] lg:w-full px-10 rounded-lg py-8 mx-auto lg:mx-0 bg-white border border-gray-200"
      >
        <h1 class="mx-auto text-4xl text-start">
          <span class="font-bold">{{ channelData.title }}</span>
          votes history
        </h1>
        <div class="flex flex-col gap-1 mx-auto lg:mx-0 lg:w-[400px] mt-10">
          <label for="input">Sort by week</label>
          <select
            id="input"
            v-model="weekInput"
            class="focus:outline-none p-3"
            @change="getChannelPosition"
          >
            <option :value="null" disabled>Select an option</option>
            <option v-for="week in weekList" :key="week.id" :value="week">
              {{ `${formatDate(week.beginning)} / ${formatDate(week.ending)}` }}
            </option>
          </select>
        </div>
        <div v-if="channelHistory" class="mt-2 mx-auto lg:mx-0 flex flex-col">
          <div class="mt-5 flex items-center text-3xl">
            <h2 class="font-bold">Position:</h2>
            <span class="ml-2">{{ channelHistory?.position }}</span>
          </div>
          <div class="mt-5 flex text-3xl items-center">
            <h2 class="font-bold">Votes:</h2>
            <span class="ml-2">{{ channelHistory?.count }}</span>
          </div>
        </div>
        <span v-else class="block font-bold text-2xl mt-6"
          >No votes computed in the selected week</span
        >
      </div>

      <VideoModal
        :show="showVideoModal"
        :setShow="setVideoModal"
        :videoUrl="currentVideoUrl"
        :hideCloseIconBigScreen="true"
      />

      <ConfirmVoteModal
        v-if="showConfirmModal"
        :show="showConfirmModal"
        :channelName="channelData.title"
        :channelPic="channelData.thumbnails.high.url"
        :setShow="setConfirmModal"
        @confirmVote="confirmVote"
      />
    </div>
  </ClientOnly>
</template>

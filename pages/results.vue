<script lang="ts" setup>
import { setScrollBody } from "~/helpers/functions";

const supabase = useSupabaseClient();

const allStore = useAllStore();
const { activeWeek, isLoading } = storeToRefs(allStore);

const weekVotes = ref<any>([]);
const showModal = ref(false);
const weekInput = ref<any>(null);
const allPrevWeeks = ref<any>([]);
const filteredVotes = ref<any>([]);

onMounted(async () => {
  let mainDiv = document.getElementById("__nuxt");
  if (mainDiv) {
    mainDiv.scrollTop = 0;
  }

  isLoading.value = true;
  if (!activeWeek.value) {
    await allStore.getActiveWeek();
  }

  weekInput.value = activeWeek.value;
  await getActiveWeekVotes();

  let req = await supabase
    .from("weeks")
    .select("*")
    .lte("beginning", activeWeek.value.beginning)
    .order("id", { ascending: false });

  allPrevWeeks.value = req.data;
  isLoading.value = false;
});

async function getActiveWeekVotes() {
  isLoading.value = true;

  let getVotes = await supabase
    .from("votes")
    .select("yt_id, yt_username, yt_thumb")
    .eq("week_id", weekInput.value.id);

  weekVotes.value = sortVotes(getVotes.data);
  filteredVotes.value = weekVotes.value;
  sortChannelsPosition(filteredVotes.value);

  supabase
    .channel("custom-insert-channel")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "votes" },
      (payload: any) => {
        let index = weekVotes.value.findIndex(
          (result: any) => result.yt_id === payload.new.yt_id && result.count
        );

        if (index !== -1) {
          weekVotes.value[index].count++;
        } else {
          weekVotes.value = [
            ...weekVotes.value,
            {
              yt_id: payload.new.yt_id,
              yt_username: payload.new.yt_username,
              yt_thumb: payload.new.yt_thumb,
              count: 1,
            },
          ];
        }

        weekVotes.value.sort((a: any, b: any) => b.count - a.count);
        filteredVotes.value = weekVotes.value;
        sortChannelsPosition(filteredVotes.value);
      }
    )
    .subscribe();

  isLoading.value = false;
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

    filteredVotes.value = order;
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
  <div class="w-full h-full">
    <div class="px-4 xl:px-0 flex flex-col w-full max-w-6xl m-auto">
      <h1 class="mt-12 pb-4 font-gloria w-fit m-auto text-3xl">
        {{
          `Results of ${
            weekInput?.id === activeWeek?.id
              ? " the current week"
              : `${new Date(weekInput?.beginning)
                  .getDate()
                  .toString()
                  .padStart(2, "0")}/${(
                  new Date(weekInput?.beginning).getMonth() + 1
                )
                  .toString()
                  .padStart(2, "0")} - ${new Date(weekInput?.ending)
                  .getDate()
                  .toString()
                  .padStart(2, "0")}/${(
                  new Date(weekInput?.ending).getMonth() + 1
                )
                  .toString()
                  .padStart(2, "0")}`
          }`
        }}
      </h1>
      <span class="w-fit underline mt-10 cursor-pointer" @click="setModal(true)"
        >When this week ends?</span
      >
      <div class="mt-10 flex flex-col gap-2">
        <label for="input">Sort by week</label>
        <select
          id="input"
          v-model="weekInput"
          class="w-full sm:w-[350px] p-3 text-black focus:outline-none"
          @change="getActiveWeekVotes"
        >
          <option value="" disabled>Choose an option</option>
          <option v-for="week in allPrevWeeks" :key="week.id" :value="week">
            {{
              `${new Date(week.beginning)
                .getDate()
                .toString()
                .padStart(2, "0")}/${(new Date(week.beginning).getMonth() + 1)
                .toString()
                .padStart(2, "0")} - ${new Date(week.ending)
                .getDate()
                .toString()
                .padStart(2, "0")}/${(new Date(week.ending).getMonth() + 1)
                .toString()
                .padStart(2, "0")}`
            }}
          </option>
        </select>
      </div>
      <div class="flex flex-wrap gap-8 md:gap-20 mt-4 mb-20 items-center">
        <div
          v-for="d in filteredVotes"
          class="flex items-center w-full max-w-[520px] h-[550px] border md:border-none rounded-lg md:shadow gap-3 md:gap-0 px-2 md:px-10 py-5 justify-center"
          :key="d.id"
          :to="`channels/${d.yt_username}`"
        >
          <h2
            class="mt-[-60px] font-bold text-[100px] md:text-[150px] text-gray-900"
            :class="[
              d.position === 1 ? 'w-fit md:w-[85px]' : 'w-fit md:w-[100px]',
            ]"
          >
            {{ d.position }}
          </h2>
          <div class="flex items-center flex-col">
            <span
              v-if="d.position === 1"
              class="italic font-bold text-xl text-gray-600 font-gloria mb-3"
              >best youtuber of the week!</span
            >
            <img
              class="w-full max-w-[230px] h-full rounded-full"
              :class="[d.position !== 1 && 'mt-12']"
              referrerpolicy="no-referrer"
              alt="Username pic"
              :src="d.yt_thumb"
            />
            <div class="p-3 mt-3 flex flex-col items-center gap-2">
              <span class="font-gloria text-2xl">{{ d.yt_username }}</span>
              <span class="mt-2 font-bold text-2xl">{{
                `${d.count} ${d.count === 1 ? "vote" : "votes"}`
              }}</span>
            </div>
            <NuxtLink
              :to="`channels/${d.yt_id}`"
              class="text-center mt-3 p-3 hover:bg-black hover:text-white transitin rounded-lg border border-black text-lg"
            >
              See channel's page
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <CountdownModal v-if="showModal" :show="showModal" :setShow="setModal" />
  </div>
</template>

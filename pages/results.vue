<script lang="ts" setup>
import { setScrollBody } from "~/helpers/functions";

const props = defineProps({
  weekVotes: Array as any,
  activeWeek: { type: Object },
});

const supabase = useSupabaseClient();

const showModal = ref(false);
const weekInput = ref<any>(null);
const allPrevWeeks = ref<any>([]);
const filteredVotes = ref<any>([]);
const loadingState = ref(false);

watchEffect(async () => {
  let mainDiv = document.getElementById("__nuxt");
  if (mainDiv) {
    mainDiv.scrollTop = 0;
  }

  try {
    if (props.activeWeek) {
      filteredVotes.value = props.weekVotes;
      weekInput.value = props.activeWeek;

      sortChannelsPosition(props.weekVotes);

      if (!allPrevWeeks.value.length) {
        loadingState.value = true;

        let req = await supabase
          .from("weeks")
          .select("*")
          .lte("beginning", props.activeWeek.beginning)
          .order("id", { ascending: false });

        loadingState.value = false;
        allPrevWeeks.value = req.data;
      }
    }
  } catch (err) {
    return err;
  }
});

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

async function getActiveWeekVotes() {
  if (props.weekVotes.length && weekInput.value.id !== props.activeWeek?.id) {
    loadingState.value = true;
    let getVotes = await supabase
      .from("votes")
      .select("yt_username, yt_thumb")
      .eq("week_id", weekInput.value.id);

    loadingState.value = false;
    filteredVotes.value = sortVotes(getVotes.data);
  } else {
    filteredVotes.value = props.weekVotes;
  }

  sortChannelsPosition(filteredVotes.value);
}

function sortVotes(votes: any) {
  let results: any = [];

  votes.forEach((vote: any) => {
    let index = results.findIndex(
      (result: any) => result.yt_username === vote.yt_username
    );

    if (index === -1) {
      results = [
        ...results,
        {
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
  <div>
    <loading :show="loadingState" />

    <div class="flex flex-col w-full max-w-6xl m-auto">
      <h1
        class="mt-12 pb-4 font-gloria font-bold w-fit m-auto border-double border-[#40c7a3] border-b-4 text-3xl"
      >
        {{
          `Results of ${
            weekInput?.id === props.activeWeek?.id
              ? " the current week"
              : `${new Date(weekInput?.beginning).getDate()}/${
                  new Date(weekInput?.beginning).getMonth() + 1
                } - ${new Date(weekInput?.ending).getDate()}/${
                  new Date(weekInput?.ending).getMonth() + 1
                }`
          }`
        }}
      </h1>
      <span
        class="w-fit font-bold underline mt-10 cursor-pointer"
        @click="setModal(true)"
        >When this week ends?</span
      >
      <div class="mt-10 flex flex-col gap-2">
        <span>Sort by week</span>
        <select
          v-model="weekInput"
          class="w-[350px] p-3 text-black"
          @change="getActiveWeekVotes"
        >
          <option value="" disabled>Choose an option</option>
          <option v-for="week in allPrevWeeks" :key="week.id" :value="week">
            {{
              `${new Date(week.beginning).getDate()}/${
                new Date(week.beginning).getMonth() + 1
              } - ${new Date(week.ending).getDate()}/${
                new Date(week.ending).getMonth() + 1
              }`
            }}
          </option>
        </select>
      </div>
      <div class="flex flex-wrap gap-20 mt-4 mb-20 items-center">
        <div
          v-for="(d, index) in filteredVotes"
          :key="d.id"
          class="flex items-center w-full max-w-[520px] h-[400px] shadow px-10 py-5 justify-center"
        >
          <h2
            class="font-bold text-[150px] text-gray-900"
            :class="[index === 0 ? 'w-[65px]' : 'w-[100px]']"
          >
            {{ d.position }}
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

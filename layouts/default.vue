<script lang="ts" setup>
const supabase: any = useSupabaseClient();
const supabaseUser: any = useSupabaseUser();

const weekVotes: any = ref([]);

const user: any = ref(null);
const activeWeek: any = ref(null);
const nextActiveWeek: any = ref(null);

const isWeekActive = ref(true);
const alreadyVoted = ref(false);
const isUserSignedIn = ref(false);
const loading = ref(true);

watchEffect(async () => {
  loading.value = true;

  if (
    (supabaseUser.value && !user.value) ||
    supabaseUser?.value?.email !== user.value?.email
  ) {
    let getUserFromDB = await getUser();
    if (getUserFromDB) {
      user.value = getUserFromDB;
      isUserSignedIn.value = true;

      let getActiveWeekFromDB = await getActiveWeek();
      if (getActiveWeekFromDB) {
        activeWeek.value = getActiveWeekFromDB;
        isWeekActive.value = true;

        await getActiveWeekVotes(activeWeek.value.id);

        let getUserVotesFromDb = await getUserVotes(
          getActiveWeekFromDB.id,
          user.value.id
        );

        if (getUserVotesFromDb >= 5) {
          alreadyVoted.value = true;
        }
      } else {
        isWeekActive.value = false;
        nextActiveWeek.value = await getNextActiveWeek();
      }
    } else {
      let saveUser = await addNewUser();
      if (saveUser) {
        isUserSignedIn.value = true;
      } else {
        isUserSignedIn.value = false;
      }
    }
  }
  loading.value = false;
});

function setAlreadyVoted(value: boolean) {
  alreadyVoted.value = value;
}

async function logout() {
  await supabase.auth.signOut();
}

async function getUser() {
  if (!supabaseUser.value) {
    user.value = null;
    return null;
  }

  let getUser: any = await supabase
    .from("users")
    .select("*")
    .eq("email", supabaseUser.value.email);

  return getUser.data.length ? getUser.data[0] : null;
}

async function getActiveWeek() {
  let getActiveWeek: any = await supabase
    .from("weeks")
    .select("*")
    .eq("active", true);

  return getActiveWeek.data.length ? getActiveWeek.data[0] : null;
}

async function getNextActiveWeek() {
  let getNextActiveWeek: any = await supabase
    .from("weeks")
    .select("*")
    .eq("is_next_active_week", true);

  return getNextActiveWeek.data.length ? getNextActiveWeek.data[0] : null;
}

function isActiveWeekThisWeek(
  activeWeekBeginning: string,
  activeWeekEnding: string
) {
  let beginning = activeWeekBeginning;
  let ending = activeWeekEnding;

  let date = new Date();
  let today = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date
    .getDate()
    .toString()
    .padStart(
      2,
      "0"
    )}T${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

  return today >= beginning && today < ending;
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

  results.sort((a: any, b: any) => b.count - a.count);
  return results;
}

async function getActiveWeekVotes(activeWeekId: number) {
  let getVotes = await supabase
    .from("votes")
    .select("yt_username, yt_thumb")
    .eq("week_id", activeWeekId);

  weekVotes.value = sortVotes(getVotes.data);

  supabase
    .channel("custom-insert-channel")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "votes" },
      (payload: any) => {
        let index = weekVotes.value.findIndex(
          (result: any) =>
            result.yt_username === payload.new.yt_username && result.count
        );

        if (index !== -1) {
          weekVotes.value[index].count++;
        } else {
          weekVotes.value = [
            ...weekVotes.value,
            {
              yt_username: payload.new.yt_username,
              yt_thumb: payload.new.yt_thumb,
              count: 1,
            },
          ];
        }
      }
    )
    .subscribe();
}

async function getUserVotes(weekId: number, userId: any) {
  let userVotes: any = await supabase
    .from("votes")
    .select("*")
    .eq("week_id", weekId)
    .eq("user_id", userId);

  return userVotes.data.length ? userVotes.data.length : 0;
}

async function addNewUser() {
  if (supabaseUser.value) {
    return await supabase
      .from("users")
      .insert({
        name: supabaseUser.value.user_metadata.full_name,
        email: supabaseUser.value.email,
        picture: supabaseUser.value.user_metadata.avatar_url,
      })
      .select();
  }

  return null;
}
</script>

<template>
  <div>
    <header class="w-full p-2 shadow">
      <div class="h-[60px] max-w-7xl m-auto flex items-center justify-between">
        <div class="flex items-center gap-8">
          <NuxtLink to="/" class="text-xl">Home</NuxtLink>
          <NuxtLink to="/results" class="text-xl">Results</NuxtLink>
        </div>

        <img
          v-if="user"
          class="cursor-pointer rounded-full w-16"
          referrerpolicy="no-referrer"
          :src="user.picture"
          @click="logout"
        />
      </div>
    </header>

    <main class="w-full max-w-7xl m-auto">
      <NuxtPage
        v-if="!loading"
        :user="user"
        :activeWeek="activeWeek"
        :nextActiveWeek="nextActiveWeek"
        :isWeekActive="isWeekActive"
        :alreadyVoted="alreadyVoted"
        :isUserSignedIn="isUserSignedIn"
        :weekVotes="weekVotes"
        @setAlreadyVoted="setAlreadyVoted"
      />
    </main>
  </div>
</template>

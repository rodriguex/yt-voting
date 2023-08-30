<script lang="ts" setup>
const supabase: any = useSupabaseClient();
const supabaseUser: any = useSupabaseUser();

const user: any = ref(null);
const activeWeek: any = ref(null);
const isWeekActive = ref(true);
const alreadyVoted = ref(true);
const isUserSignedIn = ref(true);
const data: any = ref([]);
const loading = ref(true);

onMounted(async () => {
  let getVotes = await supabase.from("votes").select("*");
  data.value = sortVotes(getVotes.data);

  supabase
    .channel("custom-insert-channel")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "votes" },
      (payload: any) => {
        let index = data.value.findIndex(
          (result: any) =>
            result.yt_username === payload.new.yt_username && result.count
        );

        if (index !== -1) {
          data.value[index].count++;
        } else {
          data.value = [
            ...data.value,
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
});

watchEffect(async () => {
  if (
    (supabaseUser.value && !user.value) ||
    supabaseUser.value?.email !== user.value?.email
  ) {
    let getUserFromDB = await getUser();
    if (getUserFromDB) {
      user.value = getUserFromDB;
      isUserSignedIn.value = true;

      let getActiveWeekFromDB = await getActiveWeek();
      if (getActiveWeekFromDB) {
        activeWeek.value = getActiveWeekFromDB;
        if (
          isActiveWeekThisWeek(
            getActiveWeekFromDB.beginning,
            getActiveWeekFromDB.ending
          )
        ) {
          isWeekActive.value = true;

          let getUserVotesFromDb = await getUserVotes(
            getActiveWeekFromDB.id,
            user.value.id
          );
          if (getUserVotesFromDb < 5) {
            alreadyVoted.value = false;
          }
        } else {
          isWeekActive.value = false;
        }
      } else {
        isWeekActive.value = false;
      }
    } else {
      let saveUser = await addNewUser();
      if (saveUser) {
        isUserSignedIn.value = true;
      } else {
        isUserSignedIn.value = false;
      }
    }
  } else if (!supabaseUser.value && !user.value) {
    isUserSignedIn.value = false;
  }

  loading.value = false;
});

function setAlreadyVoted(value: boolean) {
  alreadyVoted.value = value;
}

async function logout() {
  await supabase.auth.signOut();
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
    <header class="border w-full p-2 shadow">
      <div class="max-w-7xl m-auto flex justify-between">
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
        :isWeekActive="isWeekActive"
        :alreadyVoted="alreadyVoted"
        :isUserSignedIn="isUserSignedIn"
        :loading="loading"
        :data="data"
        @setAlreadyVoted="setAlreadyVoted"
      />
    </main>
  </div>
</template>

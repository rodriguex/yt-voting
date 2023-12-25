<script lang="ts" setup>
import axios from "axios";

const emits = defineEmits(["saveUser"]);
const supabase: any = useSupabaseClient();

const allStore = useAllStore();
const { user } = storeToRefs(allStore);

const { login } = useTokenClient({
  onSuccess: handleOnSuccess,
});

function handleOnSuccess(data: any) {
  axios
    .get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${data.access_token}`
    )
    .then((result: any) => {
      supabase
        .from("users")
        .select("*")
        .eq("email", result.data.email)
        .then((userReq: any) => {
          if (userReq.data.length) {
            localStorage.setItem("user", JSON.stringify(userReq.data[0]));
            user.value = userReq.data[0];
          } else {
            supabase
              .from("users")
              .insert({
                name: result.data.name,
                email: result.data.email,
                picture: result.data.picture,
              })
              .select()
              .then((newUser: any) => {
                localStorage.setItem("user", JSON.stringify(newUser.data[0]));
                user.value = newUser.data[0];
              });
          }
        })
        .finally(() => {
          navigateTo("/");
        });
    });
}
</script>

<template>
  <div class="w-full h-screen flex">
    <div
      class="bg-[url('~/assets/imgs/beast.jpg')] w-[45%] bg-cover bg-center bg-no-repeat"
    ></div>
    <div class="text-white crazyBg flex flex-col items-center justify-center">
      <h2 class="font-gloria w-[70%] text-center text-6xl">
        Vote for the best youtuber of the week!
      </h2>

      <button
        class="font-bold flex items-center gap-2 text-2xl font-dmSans mt-16 border-2 p-5 rounded-lg"
        @click="login"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
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
</template>

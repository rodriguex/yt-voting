<template>
  <div class="px-4 xl:px-0 my-8 lg:mt-14">
    <div
      class="w-full max-w-6xl rounded-lg mx-auto bg-white border border-gray-200 p-8"
    >
      <h1 class="font-bold text-2xl">About this project</h1>
      <div class="text-lg text-gray-700 max-w-4xl">
        <p class="mt-7">
          This is a site where you can vote for the best youtuber of the week.
          In the beginning of every week, each user gain the right to vote once.
          A week starts in every Sunday at 00:00 and ends in every Saturday at
          23:59. In the results page, the site's going to show the leaderboard
          of the week, but you can filter to find the results of previous weeks
          too.
        </p>
        <p class="mt-7">
          In the home page, you can search for your favorite youtuber and go to
          their page to see some details of the channel and even watch some of
          the videos if you want to. As explained before, you can only vote once
          per week and after vote, you will have to wait until the next week to
          be able to vote again. In this way, we can guarantee more veracity to
          the leaderboard. You can also see your votes history in
          <NuxtLink to="/my-votes" class="underline text-blue-600"
            >My votes</NuxtLink
          >
          page.
        </p>
        <p class="mt-7">
          This site was only created to be part of my portfolio of projects
          where I showcase my skills at programming. This was my first finished
          project, but others are coming soon. If you'd like to see what I'm
          building now, check it out my
          <a
            href="https://github.com/rodriguex"
            target="_blank"
            class="underline text-blue-600"
          >
            Github account</a
          >. This site is open source and all of my future projects very likely
          will be too.
        </p>
        <p class="mt-7">
          I'm currently looking for my next job, so if you interested, contact
          me via my email:
          <span class="underline text-gray-900">gustardn@gmail.com</span>. I'd
          like to talk and be part of good opportunities :).
        </p>
      </div>
    </div>
  </div>
</template>

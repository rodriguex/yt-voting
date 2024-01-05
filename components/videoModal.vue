<script lang="ts" setup>
defineProps({
  show: { type: Boolean },
  setShow: { type: Function, default: () => {} },
  videoUrl: { type: String },
});
</script>

<template>
  <modal :show="show" :setShow="setShow" :hideCloseIconBigScreen="true">
    <iframe
      title="Iframe of the choosen channel video."
      :src="`http://www.youtube.com/embed/${videoUrl}`"
      width="100%"
      height="100%"
      allowfullscreen
    ></iframe>
  </modal>
</template>

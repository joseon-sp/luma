<template>
  <div :class="classes">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  rounded: {
    type: String,
    default: "",
  },
  width: {
    type: String,
    default: "full",
  },
  height: {
    type: String,
    default: "",
  },
  additionalClasses: {
    type: String,
    default: "",
  },
});

const classes = computed(() =>
  [
    "rounded-box bg-gray-50 dark:bg-gray-900 skeleton",
    props.rounded,
    props.width === "full" ? "w-full" : `w-${props.width}`,
    props.height ? `h-${props.height}` : "",
    props.additionalClasses,
  ]
    .filter(Boolean)
    .join(" ")
);
</script>

<style scoped>
.skeleton {
  will-change: background-position;
  animation: skeleton 1.8s ease-in-out infinite;
  background-image: linear-gradient(
    105deg,
    transparent 0%,
    transparent 40%,
    rgba(156, 163, 175, 0.1) 50%,
    transparent 60%,
    transparent 100%
  );
  background-size: 200% auto;
  background-repeat: no-repeat;
  background-position-x: -50%;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation-duration: 15s;
  }
}

@keyframes skeleton {
  from {
    background-position: 150%;
  }
  to {
    background-position: -50%;
  }
}
</style>

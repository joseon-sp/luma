<template>
  <div class="mb-3 break-inside-avoid overflow-hidden">
    <div class="relative rounded-lg overflow-hidden">
      <!-- Image or Placeholder with Skeleton -->
      <div class="relative w-full" :class="{ 'bg-gray-900': item.thumbnail }">
        <!-- Skeleton Overlay -->
        <Skeleton
          v-if="item.thumbnail && !imageLoaded"
          class="absolute inset-0 w-full h-full object-cover opacity-75"
        />
        <!-- Image -->
        <NuxtImg
          v-if="item.thumbnail"
          :src="`https://cdn.joseon.space/thumbnail/${item.thumbnail.id}.webp`"
          :width="item.thumbnail.optimized_width"
          :height="item.thumbnail.optimized_height"
          class="w-full h-full object-cover opacity-75 min-h-56"
          alt="Heritage Item Thumbnail"
          @load="handleImageLoad"
        />
        <!-- Placeholder for No Thumbnail -->
        <div
          v-else
          class="w-full h-52 border border-gray-200 dark:border-gray-800 rounded-lg"
        ></div>
      </div>

      <!-- Overlay for Text Visibility -->

      <!-- Card Content -->
      <div class="absolute inset-0 flex flex-col justify-between p-4">
        <!-- Top Section: Era and Name -->
        <div class="text-left z-10 text-white" v-if="item.thumbnail">
          <p>{{ item.era }}</p>
          <h3 class="text-xl font-semibold break-keep">{{ item.name }}</h3>
        </div>
        <div class="text-right z-10" v-if="item.thumbnail">
          <p
            class="pointer-events-none select-none text-2xl font-extrabold text-white/50"
          >
            {{ item.name_hanja }}
          </p>
        </div>

        <!-- Content for Items Without Thumbnail -->
        <div v-else class="flex flex-col justify-between h-full">
          <div class="flex justify-between">
            <div>
              <p>{{ item.era }}</p>
              <h3 class="text-xl font-semibold break-keep">{{ item.name }}</h3>
            </div>
            <div>
              <h3 class="font-semibold break-keep">
                {{ item.name_hanja }}
              </h3>
            </div>
          </div>
          <p class="text-sm line-clamp-4">
            {{ item.description || "" }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  item: HeritageItem;
}>();

const imageLoaded = ref(false);

// Handle image load event
const handleImageLoad = () => {
  imageLoaded.value = true;
};
</script>

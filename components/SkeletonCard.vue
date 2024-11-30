<template>
  <ClientOnly>
    <div class="mb-3 break-inside-avoid overflow-hidden">
      <div class="relative rounded-lg overflow-hidden">
        <!-- Image Skeleton -->
        <Skeleton
          :style="{
            height: `${Math.floor(Math.random() * (28 - 12 + 1)) + 12}rem`,
          }"
          class="w-full object-cover opacity-75"
        />

        <!-- Content Skeletons -->

        <div class="absolute inset-0 flex flex-col justify-between p-4">
          <!-- Name Skeletons -->
          <div class="absolute inset-0 flex flex-col p-4 space-y-2">
            <Skeleton
              :style="{ width: `${Math.floor(Math.random() * 41) + 20}%` }"
              class="h-3 rounded-sm"
            />
            <Skeleton
              class="h-6 rounded-sm"
              :style="{ width: `${Math.floor(Math.random() * 61) + 40}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

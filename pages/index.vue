<template>
  <div class="fixed top-0 left-0 p-2 text-sm z-50">
    <p>
      <strong>평균 검색 시간:</strong>
      {{ averageSearchTime }} ms<br />
      <strong>총 검색 요청 수:</strong> {{ totalSearches }}
    </p>
  </div>

  <div class="container">
    <div
      class="sticky top-0 flex flex-col items-center mt-[30vh] mb-10 pb-2 bg-background z-50"
    >
      <h2 class="h2">Luma Search demo</h2>
      <Input
        @input="onInput"
        type="text"
        placeholder="검색하기"
        class="max-w-2xl"
      />
    </div>

    <div
      v-if="heritageItems.length > 0"
      class="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div
        :key="item.id"
        class="mb-3 break-inside-avoid overflow-hidden"
        v-for="item in heritageItems"
      >
        <div class="relative overflow-hidden rounded-lg">
          <!-- Image container with clamped aspect ratio -->
          <div class="relative-container relative w-full">
            <!-- Image filling the container with object-cover to prevent blank space -->
            <img
              v-if="item.thumbnail"
              :src="item.thumbnail"
              class="w-full h-full object-cover opacity-75"
              alt="Heritage Item Thumbnail"
            />
          </div>

          <!-- Dark overlay for better text visibility -->
          <div class="absolute inset-0 bg-zinc-950/30"></div>

          <!-- Card content -->
          <div class="absolute bottom-4 left-4 z-10 text-white">
            <p>{{ item.era }}</p>
            <h3 class="text-xl font-semibold break-keep">
              <span v-if="item.name_hanja">{{ item.name }}</span>
            </h3>
          </div>

          <!-- Hanja name overlay -->
          <div class="absolute top-4 right-4 z-10">
            <p
              class="pointer-events-none select-none break-keep text-2xl font-extrabold text-right text-white/30"
            >
              <span v-if="item.name_hanja">{{ item.name_hanja }}</span>
            </p>
          </div>
        </div>
        <Breadcrumb class="mt-1">
          <BreadcrumbList>
            <BreadcrumbItem v-if="item.categories1">
              <BreadcrumbLink href="#">
                {{ item.categories1.name }}
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator v-if="item.categories2" />

            <BreadcrumbItem v-if="item.categories2">
              <BreadcrumbLink href="#">
                {{ item.categories2.name }}
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator v-if="item.categories3" />

            <BreadcrumbItem v-if="item.categories3">
              <BreadcrumbLink href="#">
                {{ item.categories3.name }}
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator v-if="item.categories4" />

            <BreadcrumbItem v-if="item.categories4">
              <BreadcrumbLink href="#">
                {{ item.categories4.name }}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>

    <!-- Display a message if no results are found -->
    <p v-else class="text-center">No results found</p>
  </div>
</template>

<script setup lang="ts">
// Initialize Supabase client
const supabase = useSupabaseClient();

// Reactive state
const searchPhrase = ref("");
const heritageItems = ref([]);

// Statistics
const totalSearches = ref(0);
const totalSearchTime = ref(0);

// Computed property for average search time
const averageSearchTime = computed(() => {
  return totalSearches.value === 0
    ? 0
    : (totalSearchTime.value / totalSearches.value / 10).toFixed(2);
});

// Function to handle input event
const onInput = (event: Event) => {
  searchPhrase.value = (event.target as HTMLInputElement).value;
  searchHeritageItems();
};

// Function to format dates
const formatDate = (date: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString("ko-KR", options);
};

// Function to search for heritage items
const searchHeritageItems = async () => {
  if (searchPhrase.value.trim() === "") {
    heritageItems.value = []; // Clear results if search is empty
    return;
  }

  const startTime = performance.now(); // Start timing

  // Fetch matching heritage items from Supabase using ilike (case-insensitive search)
  const { data, error } = await supabase
    .from("heritage_items")
    .select(
      `
      id,
      name,
      name_hanja,
      content,
      longitude,
      latitude,
      location_description,
      era,
      owner,
      manager,
      type,
      quantity,
      registered_date,
      management_number,
      linkage_number,
      thumbnail,
      images (id, image_url, description),
      videos (id, video_url),
      categories1:category1_id (id, name),
      categories2:category2_id (id, name),
      categories3:category3_id (id, name),
      categories4:category4_id (id, name)
    `
    )
    .ilike("name", `%${searchPhrase.value}%`);

  const endTime = performance.now(); // End timing
  const searchDuration = endTime - startTime;

  // Update statistics
  totalSearches.value += 1;
  totalSearchTime.value += searchDuration;

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  heritageItems.value = data || [];
};
</script>

<style scoped>
.relative-container {
  position: relative;
  width: 100%;
  min-height: calc(var(--container-width) * 0.3);
  max-height: calc(var(--container-width) * 2);
}
</style>

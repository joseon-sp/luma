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

    <!-- Display search results using the Card component -->
    <div v-if="heritageItems.length > 0" class="grid gap-4">
      <Card
        v-for="item in heritageItems"
        :key="item.id"
        class="w-full max-w-2xl mx-auto"
      >
        <CardHeader>
          <CardTitle>
            {{ item.name }}
            <span v-if="item.name_hanja">({{ item.name_hanja }})</span>
          </CardTitle>
          <CardDescription v-if="item.longitude && item.latitude">
            <div class="flex flex-col">
              <span>경도: {{ item.longitude }}</span>
              <span>위도: {{ item.latitude }}</span>
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent class="space-y-2">
          <p v-if="item.location_description">
            <strong>주소:</strong> {{ item.location_description }}
          </p>
          <p v-if="item.era"><strong>시대:</strong> {{ item.era }}</p>
          <p v-if="item.owner"><strong>소유자:</strong> {{ item.owner }}</p>
          <p v-if="item.manager"><strong>관리자:</strong> {{ item.manager }}</p>
          <p v-if="item.type"><strong>유형:</strong> {{ item.type }}</p>
          <p v-if="item.quantity"><strong>수량:</strong> {{ item.quantity }}</p>
          <p v-if="item.registered_date">
            <strong>등록일:</strong> {{ formatDate(item.registered_date) }}
          </p>
          <p v-if="item.management_number">
            <strong>관리 번호:</strong> {{ item.management_number }}
          </p>
          <p v-if="item.linkage_number">
            <strong>연계 번호:</strong> {{ item.linkage_number }}
          </p>
          <!-- <p><strong>내용:</strong> {{ item.content }}</p> -->
        </CardContent>

        <CardContent v-if="item.thumbnail" class="mt-4">
          <AspectRatio :ratio="16 / 9">
            <div class="relative w-full h-full">
              <img
                :src="item.thumbnail"
                alt="Thumbnail"
                class="rounded-md object-cover w-full h-full"
                loading="lazy"
              />
              <Skeleton
                class="absolute inset-0 rounded-md object-cover w-full h-full"
              />
            </div>
          </AspectRatio>
        </CardContent>
      </Card>
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
      videos (id, video_url)
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

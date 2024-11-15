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
        v-model="searchPhrase"
        @input="debouncedSearch"
        type="text"
        placeholder="검색하기"
        class="max-w-2xl"
      />
    </div>

    <div
      v-if="Array.isArray(heritageItems) && heritageItems.length > 0"
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
            <NuxtImg
              v-if="item.thumbnail"
              :src="item.thumbnail.url"
              :width="item.thumbnail.width"
              :height="item.thumbnail.height"
              class="w-full h-full object-cover opacity-75 min-h-56"
              alt="Heritage Item Thumbnail"
            />
            <div
              v-else
              class="w-full h-52 object-cover bg-zinc-900 text-white text-lg font-bold flex items-center justify-center"
            >
              <p>이미지 없음</p>
            </div>
          </div>

          <!-- Dark overlay for better text visibility -->
          <div class="absolute inset-0 bg-zinc-950/30"></div>

          <!-- Card content -->
          <div class="absolute bottom-4 left-4 z-10 text-white">
            <p>{{ item.era }}</p>
            <h3 class="text-xl font-semibold break-keep">
              <span v-if="item.name">{{ item.name }}</span>
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

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="text-center my-4">Loading...</div>

    <!-- End of Page Message -->
    <div
      v-if="
        !hasMore && Array.isArray(heritageItems) && heritageItems.length > 0
      "
      class="text-center my-4"
    >
      <p>You've reached the end of the results.</p>
    </div>

    <!-- Display a message if no results are found -->
    <p
      v-else-if="
        !isLoading && Array.isArray(heritageItems) && heritageItems.length === 0
      "
      class="text-center"
    >
      No results found
    </p>

    <!-- Debugging: Display the type and length of heritageItems -->
    <!-- <p class="text-red-500 text-center">
      Type of heritageItems: {{ typeof heritageItems }} | Length: {{ heritageItems.length }}
    </p> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import debounce from "lodash/debounce"; // Ensure lodash is installed

// Initialize Supabase client
const supabase = useSupabaseClient();

// Reactive state
const searchPhrase = ref("");
const heritageItems = ref<HeritageItem[]>([]);
const currentPage = ref(1);
const pageSize = 20; // Number of items per page
const hasMore = ref(true);
const isLoading = ref(false);

// Statistics
const totalSearches = ref(0);
const totalSearchTime = ref(0);

// Computed property for average search time
const averageSearchTime = computed(() => {
  return totalSearches.value === 0
    ? "0.00"
    : (totalSearchTime.value / totalSearches.value / 10).toFixed(2);
});

// Debounced search function to prevent excessive API calls
const debouncedSearch = debounce(() => {
  currentPage.value = 1;
  heritageItems.value = [];
  hasMore.value = true;
  searchHeritageItems();
}, 300);

// Function to handle input event (if still needed)
const onInput = (event: Event) => {
  searchPhrase.value = (event.target as HTMLInputElement).value;
  debouncedSearch();
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

// Function to search for heritage items with pagination
const searchHeritageItems = async () => {
  if (searchPhrase.value.trim() === "") {
    heritageItems.value = []; // Clear results if search is empty
    hasMore.value = false;
    return;
  }

  if (!hasMore.value) return; // No more data to fetch

  isLoading.value = true;
  const startTime = performance.now(); // Start timing

  // Fetch matching heritage items from Supabase using ilike (case-insensitive search)
  const { data, error, count } = await supabase
    .from("heritage_items")
    .select(
      `
      id,
      name,
      name_hanja,
      era,
      thumbnail:thumbnail (url, width, height),
      categories1:category1_id (id, name),
      categories2:category2_id (id, name),
      categories3:category3_id (id, name),
      categories4:category4_id (id, name)
    `,
      { count: "exact" }
    )
    .ilike("name", `%${searchPhrase.value}%`)
    .order("id", { ascending: true })
    .range(
      (currentPage.value - 1) * pageSize,
      currentPage.value * pageSize - 1
    );

  const endTime = performance.now(); // End timing
  const searchDuration = endTime - startTime;

  // Update statistics
  totalSearches.value += 1;
  totalSearchTime.value += searchDuration;

  if (error) {
    console.error("Error fetching data:", error);
    isLoading.value = false;
    return;
  }

  if (data) {
    heritageItems.value = heritageItems.value.concat(data);
    console.log("heritageItems after concat:", heritageItems.value);
    // Determine if more data is available
    if (count !== null) {
      hasMore.value = heritageItems.value.length < count;
    } else {
      // If count is not returned, assume no more data if fetched less than pageSize
      hasMore.value = data.length === pageSize;
    }
    currentPage.value += 1;
  } else {
    heritageItems.value = heritageItems.value.concat([]);
  }

  isLoading.value = false;
};

// Infinite scroll handler
const handleScroll = () => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const threshold = document.body.offsetHeight - 500; // Trigger 500px before bottom
  if (scrollPosition >= threshold && !isLoading.value && hasMore.value) {
    searchHeritageItems();
  }
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

// Type definition for heritage items (adjust as needed)
interface HeritageItem {
  id: number;
  name: string;
  name_hanja?: string;
  era: string;
  thumbnail?: { url: string; width: number; height: number };
  categories1?: { id: number; name: string };
  categories2?: { id: number; name: string };
  categories3?: { id: number; name: string };
  categories4?: { id: number; name: string };
}
</script>

<style scoped>
.relative-container {
  position: relative;
  width: 100%;
  /* Adjust min-height and max-height as needed */
  min-height: 200px;
  max-height: 400px;
}
</style>

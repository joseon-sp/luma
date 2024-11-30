<template>
  <!-- Top right for settings -->
  <div class="fixed top-0 right-0 p-2 text-sm z-50">
    <UColorModeButton />
  </div>

  <!-- Search Section -->
  <div class="fixed bottom-0 w-full flex flex-col items-center mb-10 z-50 mx-2">
    <div
      class="flex h-14 shadow-lg shadow-gray-500/30 bg-gray-100 dark:bg-gray-900 bg-opacity-70 dark:bg-opacity-80 w-full max-w-lg py-2 px-4 rounded-full backdrop-blur-sm border border-gray-100/60 dark:border-gray-600/60 items-center"
    >
      <NuxtLink to="/" class="w-8 h-8 hover:opacity-75">
        <NuxtImg
          src="/logo.webp"
          width="1024"
          height="1024"
          alt="조선스페이스 로고"
        />
      </NuxtLink>

      <UInput
        v-model="searchPhrase"
        @input="SearchInputUpdate"
        type="text"
        placeholder="검색하기"
        variant="none"
        size="lg"
        class="w-full"
      />
    </div>
  </div>

  <ULandingHero
    title="루마 데모"
    description="이 웹 애플리케이션은 활발히 개발되고 있습니다. 최종 품질이나 제품을 나타내지 않습니다."
  />

  <!-- Heritage Items or Skeletons -->
  <div class="flex flex-col items-center w-full">
    <!-- Heritage Items -->
    <div v-if="heritageItems.length" class="w-full">
      <div
        v-for="(batch, batchIndex) in heritageItems"
        :key="'batch-' + batchIndex"
        class="w-full"
      >
        <!-- Divider Between Batches -->
        <UDivider
          v-if="batchIndex"
          :label="`${batchIndex + 1} / ${totalPages}`"
          class="my-6"
        />

        <!-- Masonry Layout -->
        <div
          class="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 px-4 sm:px-6 lg:px-8 max-w-[380px] sm:max-w-none mx-auto"
        >
          <HeritageCard v-for="item in batch" :key="item.id" :item="item" />
        </div>
      </div>
    </div>

    <!-- Skeletons for Loading State -->
    <div v-if="isLoading" class="w-full">
      <div
        class="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 px-4 sm:px-6 lg:px-8 max-w-[380px] sm:max-w-none mx-auto"
      >
        <SkeletonCard v-for="n in 10" />
      </div>
    </div>

    <!-- End of Page Message -->
    <div
      v-if="!hasMore && heritageItems.length"
      class="text-center my-4 mt-8 mb-48"
    >
      <p>결과의 끝에 다다랐습니다.</p>
    </div>

    <!-- No Results Found Message -->
    <p
      v-else-if="!isLoading && !heritageItems.length && searchPhrase !== ''"
      class="text-center"
    >
      검색 결과가 없습니다.
    </p>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();

const searchPhrase = ref("");
const heritageItems = ref<HeritageItem[][]>([]); // Array of batches with descriptions
const currentPage = ref(1);
const pageSize = 20;
const hasMore = ref(true);
const isLoading = ref(false);

const totalSearches = ref(0);
const totalSearchTime = ref(0);
const totalCount = ref<number | null>(null); // Store total item count

// Compute total pages
const totalPages = computed(() => {
  if (totalCount.value !== null) {
    return Math.ceil(totalCount.value / pageSize);
  }
  return 1;
});

// Async function to fetch description
const getHeritageItemDescription = async (item: HeritageItem) => {
  try {
    const { data, error } = await supabase
      .from("heritage_items")
      .select("content")
      .eq("id", item.id)
      .single();

    if (error) {
      console.error("Description fetch error:", error.message);
      return "설명 없음";
    }

    return data?.content || "설명 없음";
  } catch (err) {
    console.error("Unexpected error:", err);
    return "설명 없음";
  }
};

const SearchInputUpdate = (event: InputEvent) => {
  searchPhrase.value = (event.target as HTMLInputElement).value;
  search();
};

// Search function triggered by input
const search = () => {
  heritageItems.value = []; // Reset heritageItems
  currentPage.value = 1;
  hasMore.value = true;
  totalCount.value = null; // Reset totalCount
  if (searchPhrase.value === "") {
    hasMore.value = false;
    return;
  }
  searchHeritageItems();
};

// Function to search heritage items and preload descriptions
const searchHeritageItems = async () => {
  if (!hasMore.value || isLoading.value || searchPhrase.value.trim() === "")
    return;

  isLoading.value = true;
  const startTime = performance.now();

  try {
    const { data, error, count } = await supabase
      .from("heritage_items")
      .select(
        `
        id,
        name,
        name_hanja,
        era,
        thumbnail:thumbnail (id, optimized_width, optimized_height),
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

    const endTime = performance.now();
    totalSearches.value += 1;
    totalSearchTime.value += endTime - startTime;

    if (error) {
      console.error("Search error:", error.message);
      return;
    }

    if (data) {
      // Fetch descriptions for all items in the current batch
      const itemsWithDescriptions = await Promise.all(
        data.map(async (item) => {
          const description = await getHeritageItemDescription(item);
          return { ...item, description };
        })
      );

      heritageItems.value.push(itemsWithDescriptions); // Push the new batch with descriptions
      totalCount.value = count !== null ? count : totalCount.value; // Update totalCount if available
      hasMore.value =
        count !== null
          ? heritageItems.value.flat().length < count
          : data.length === pageSize;
      currentPage.value++;
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  } finally {
    isLoading.value = false;
  }
};

// Handle infinite scroll
const handleScroll = () => {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
    !isLoading.value &&
    hasMore.value
  ) {
    searchHeritageItems();
  }
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

interface HeritageItem {
  id: number;
  name: string;
  name_hanja?: string;
  era: string;
  thumbnail?: {
    id: string;
    optimized_width: number;
    optimized_height: number;
  };
  categories1?: { id: number; name: string };
  categories2?: { id: number; name: string };
  categories3?: { id: number; name: string };
  categories4?: { id: number; name: string };
  description?: string; // Added description field
}
</script>

<style scoped>
/* Optional: Add some margin between batches */
.columns-1,
.columns-2,
.columns-3,
.columns-4 {
  break-inside: avoid;
}
</style>

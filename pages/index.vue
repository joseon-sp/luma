<template>
  <div class="container">
    <h1>Luma Search demo</h1>
    <p style="text-align: center">
      Total <b>17,208</b> heritage items <br />Total <b>98,095</b> Media
    </p>
    <input
      :value="searchPhrase"
      @input="onInput"
      type="text"
      placeholder="검색하기"
      class="search-input"
    />

    <!-- Statistics Section -->
    <div class="search-statistics">
      <p><strong>총 검색 요청 수:</strong> {{ totalSearches }}</p>
      <p><strong>평균 검색 시간:</strong> {{ averageSearchTime }} ms</p>
    </div>

    <!-- Display search results using v-for -->
    <div v-if="heritageItems.length > 0" class="results">
      <div v-for="item in heritageItems" :key="item.id" class="card">
        <div class="card-header">
          <h2>
            {{ item.name }}
            <span v-if="item.name_hanja">({{ item.name_hanja }})</span>
          </h2>
          <div class="location">
            <span>경도: {{ item.longitude }}</span>
            <span>위도: {{ item.latitude }}</span>
          </div>
        </div>

        <div class="card-body">
          <p v-if="item.location_description">
            <strong>위치 설명:</strong> {{ item.location_description }}
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
          <p><strong>내용:</strong> {{ item.content }}</p>
        </div>

        <div
          class="card-media"
          v-if="item.thumbnail || item.images.length || item.videos.length"
        >
          <img
            v-if="item.thumbnail"
            :src="item.thumbnail"
            alt="Thumbnail"
            class="thumbnail"
            loading="lazy"
          />

          <!-- <div v-if="item.images.length" class="media-section">
            <h3>이미지</h3>
            <div class="images">
              <img
                v-for="image in item.images"
                :key="image.id"
                :src="image.image_url"
                :alt="image.description || 'Heritage Image'"
                class="media-image"
              />
            </div>
          </div>

          <div v-if="item.videos.length" class="media-section">
            <h3>비디오</h3>
            <div class="videos">
              <video
                v-for="video in item.videos"
                :key="video.id"
                :src="video.video_url"
                controls
                class="media-video"
              ></video>
            </div>
          </div> -->
        </div>
      </div>
    </div>

    <!-- Display a message if no results are found -->
    <p v-else class="no-results">No results found</p>
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

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.search-input {
  display: block;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 80%;
  max-width: 400px;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #007bff;
  outline: none;
}

/* New Styles for Statistics */
.search-statistics {
  text-align: center;
  margin-top: 1rem;
  font-size: 1rem;
  color: #555;
}

.search-statistics p {
  margin: 0.25rem 0;
}

.results {
  margin-top: 2rem;
}

.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.location {
  font-size: 0.9rem;
  color: #555;
  margin-top: 0.5rem;
}

.card-body p {
  margin: 0.5rem 0;
  line-height: 1.6;
  color: #444;
}

.card-media {
  margin-top: 1rem;
}

.thumbnail {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 4px;
}

.media-section {
  margin-top: 1rem;
}

.media-section h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.images {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.media-image {
  width: calc(33.333% - 0.5rem);
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.videos {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.media-video {
  width: calc(50% - 0.5rem);
  height: 200px;
  border-radius: 4px;
}

.no-results {
  text-align: center;
  color: #888;
  margin-top: 2rem;
  font-size: 1.2rem;
}
</style>

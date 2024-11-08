<template>
  <div class="relative">
    <button
      class="ai-generate-button rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
      :class="{ 'bg-indigo-700': showAIPanel }"
      @click="openAiPanel"
    >
      <span class="flex items-center gap-1" @click="openAiPanel">
        <SparklesIcon class="h-4 w-4" @click="openAiPanel" />
        AI Generate
      </span>
    </button>

    <!-- AI Panel -->
    <div
      v-if="showAIPanel"
      v-click-outside="closePanel"
      class="ai-panel absolute right-0 top-full z-50 mt-2 w-96 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="space-y-4">
        <!-- Model Selection -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Model
          </label>
          <select
            v-model="selectedModel"
            class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
            :disabled="isLoading"
          >
            <option v-for="model in models" :key="model" :value="model">
              {{ model.name }}
            </option>
          </select>
        </div>

        <!-- System Prompt -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            System Prompt
          </label>
          <textarea
            v-model="systemPrompt"
            rows="3"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
            :disabled="isLoading"
          ></textarea>
        </div>

        <!-- Generation Prompt -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Prompt
          </label>
          <textarea
            v-model="prompt"
            rows="3"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
            :disabled="isLoading"
            @keydown.ctrl.enter.prevent="generateCode"
            @keydown.meta.enter.prevent="generateCode"
          ></textarea>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Press {{ isMac ? '⌘' : 'Ctrl' }} + Enter to generate
          </p>
        </div>

        <!-- Generate Button -->
        <button
          class="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          :disabled="isLoading || !selectedModel || !prompt.trim()"
          @click="generateCode"
        >
          <template v-if="isLoading">
            <svg
              class="mx-auto h-5 w-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </template>
          <template v-else>Generate Code</template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { SparklesIcon } from '@heroicons/vue/24/outline';
import { useNotificationStore } from '../stores/notifications';
import { vClickOutside } from '../directives/click-outside';

const emit = defineEmits<{
  (e: 'insert-code', code: string): void;
}>();

const notificationStore = useNotificationStore();
const showAIPanel = ref(false);
const selectedModel = ref('');
const systemPrompt = ref(
  'I want you to act as an HTML component generator using only Tailwind CSS for styling. I will provide specific instructions for each component, and you will respond with the HTML markup alone, styled according to modern design and best practices. Do not include any additional information, explanations, or extra HTML structure (no html, head, or body tags). Your goal is to create the most accurate and visually appealing component based on my instructions. My first component request is:'
);
const prompt = ref('');
const models = ref<string[]>([]);
const isLoading = ref(false);
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

onMounted(async () => {
  await fetchModels();
});

const fetchModels = async () => {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    const data = await response.json();
    models.value = data.models || [];
    if (models.value.length > 0) {
      selectedModel.value = models.value[0];
    }
  } catch (error) {
    console.error('Failed to fetch models:', error);
    notificationStore.addNotification('Failed to fetch AI models', 'error');
  }
};

const generateCode = async () => {
  if (!selectedModel.value || !prompt.value.trim()) return;

  isLoading.value = true;

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel.value.model,
        stream: false,
        prompt: `${systemPrompt.value}${prompt.value}`,
      }),
    }).then(async function (response) {
        if (!response.ok) {
              throw new Error('Failed to generate code');
            }
            const responseText = await response.text();
            console.log('Raw response:', responseText); // Add this line to inspect the response
            const data = JSON.parse(responseText);
            emit('insert-code', data.response);
            showAIPanel.value = false;
            notificationStore.addNotification('Code generated successfully');
    }).catch(function (error) {
        console.error('Failed to generate code:', error);
        notificationStore.addNotification('Failed to generate code', 'error');
        showAIPanel.value = false;
    });
  } catch (error) {
    console.error('Failed to generate code:', error);
    notificationStore.addNotification('Failed to generate code', 'error');
  } finally {
    isLoading.value = false;
  }
};

/**
 * Close the AI panel.
 * @since 0.1.0
 */
const closePanel = (event) => {
  if (
    !event.target.closest('.ai-panel') &&
    !event.target.closest('.ai-generate-button')
  )
    showAIPanel.value = false;
};

const openAiPanel = () => {
  showAIPanel.value = true;
  console.log(showAIPanel.value);
};
</script>

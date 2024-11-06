import { ref } from 'vue';
import { ipcRenderer } from 'electron';

const styles = ref<string>('');
const styleCache = new Map<string, string>();

export const initializeTailwindStyles = async () => {
    try {
        // Check cache first
        const cachedStyles = styleCache.get('tailwind');
        if (cachedStyles) {
            styles.value = cachedStyles;
            return;
        }

        // Try to fetch the latest Tailwind CSS
        const response = await fetch('https://cdn.jsdelivr.net/npm/tailwindcss@latest/dist/tailwind.min.css');
        const css = await response.text();

        // Update cache
        styleCache.set('tailwind', css);

        // Store in localStorage for offline use
        localStorage.setItem('tailwindStyles', css);
        styles.value = css;

        // Save to file system using IPC
        await ipcRenderer.invoke('save:tailwindcss', css);
    } catch (error) {
        console.log('Using cached Tailwind CSS');
        try {
            // First try to load from file
            const fileContent = await ipcRenderer.invoke('load:tailwindcss');
            if (fileContent) {
                styleCache.set('tailwind', fileContent);
                styles.value = fileContent;
                return;
            }
        } catch (fileError) {
            console.log('Could not load from file, trying localStorage');
        }

        // If file load fails, try localStorage
        const cached = localStorage.getItem('tailwindStyles');
        if (cached) {
            styleCache.set('tailwind', cached);
            styles.value = cached;
        } else {
            // Fallback minimal styles
            const fallbackStyles = `
                *, ::before, ::after { box-sizing: border-box; margin: 0; padding: 0; }
                .dark { background-color: rgb(17, 24, 39); color: rgb(243, 244, 246); }
            `;
            styleCache.set('tailwind', fallbackStyles);
            styles.value = fallbackStyles;
        }
    }
};

export const getPreviewStyles = () => {
    return `
        ${styles.value}

        /* Custom styles */
        body {
            margin: 0;
            padding: 1rem;
        }

        .dark {
            background-color: rgb(17, 24, 39);
            color: rgb(243, 244, 246);
        }
    `;
};

// Clear cache when needed
export const clearStyleCache = () => {
    styleCache.clear();
};

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'life-red': '#FF3B30',
                'life-black': '#000000',
                'life-white': '#FFFFFF',
                'life-gray': '#1A1A1A',
            }
        },
    },
    plugins: [],
}

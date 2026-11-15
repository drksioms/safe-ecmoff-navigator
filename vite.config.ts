import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({base:'./',plugins:[tailwindcss()],publicDir:false,server:{fs:{strict:true,deny:['**/*.pdf','**/*.PDF','**/docs/**','**/.*/**']}},build:{sourcemap:false}});

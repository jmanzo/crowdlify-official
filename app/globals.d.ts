declare module "*.css";

declare global {
    interface Window {
        shopify: {
            saveBar: {
                show: (id: string) => void;
                hide: (id: string) => void;
            }
        }
    }
}

export {};
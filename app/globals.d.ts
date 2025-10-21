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

    namespace JSX {
        interface IntrinsicElements {
            's-app-nav': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            's-link': React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
            's-page': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            's-button': React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
            's-section': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            's-stack': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            's-box': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            's-table': React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
            's-table-header-row': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            's-table-header': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            's-table-body': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            's-table-row': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            's-table-cell': React.DetailedHTMLProps<React.TdHTMLAttributes<HTMLTableCellElement>, HTMLTableCellElement>;
            's-text-field': React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
            's-url-field': React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
            's-text-area': React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
            's-select': React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
            's-option': React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
            's-switch': React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
        }
    }
}

export {};
import type { OpenClawPluginApi } from "./plugins/types.js";
type RegistrablePlugin = {
    id: string;
    register: (api: OpenClawPluginApi) => void;
};
export declare const bundledWebSearchPluginRegistrations: ReadonlyArray<{
    readonly plugin: RegistrablePlugin;
    credentialValue: unknown;
}>;
export {};

export default function viteElectron(pluginConfig: any): {
    name: string;
    configResolved(resolvedConfig: any): void;
    configureServer({ httpServer }: {
        httpServer: any;
    }): void;
    closeBundle(): void;
};

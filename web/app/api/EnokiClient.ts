import { EnokiClient } from "@mysten/enoki";
import { z } from "zod";

const serverConfigSchema = z.object({
    ENOKI_SECRET_KEY: z.string(),
});

const serverConfig = serverConfigSchema.parse({
    ENOKI_SECRET_KEY: process.env.ENOKI_SECRET_KEY,
});

export const enokiClient = new EnokiClient({
    apiKey: serverConfig.ENOKI_SECRET_KEY,
});


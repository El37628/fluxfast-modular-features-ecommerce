import { defineFluxConfig } from "@fluxfast/next";
import { FluxApplication } from "@/.fluxfast/pages.generated";

export const fluxConfig = defineFluxConfig({
  application: FluxApplication,
});

export type DerivedLevel = "basic" | "standard" | "full";

export type DerivedEnvelope<TFeatures> = {
  version: "v1";
  asOf: string;
  level: DerivedLevel;
  features: TFeatures;
  warnings?: string[];
};

export function createDerivedEnvelope<TFeatures>(
  level: DerivedLevel,
  features: TFeatures,
  warnings: string[] = []
): DerivedEnvelope<TFeatures> {
  return {
    version: "v1",
    asOf: new Date().toISOString(),
    level,
    features,
    warnings
  };
}

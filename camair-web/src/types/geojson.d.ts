// src/types/geojson.d.ts (or src/declarations/geojson.d.ts)
declare module '*.geojson' {
  const value: any;
  export default value;
}

// Also for .json if needed
declare module '*.json' {
  const value: any;
  export default value;
}
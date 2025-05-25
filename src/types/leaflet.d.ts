declare module 'leaflet' {
  export interface LatLng {
    lat: number;
    lng: number;
  }

  export interface Map {
    setView(latLng: [number, number], zoom: number): this;
    on(event: string, handler: (e: LeafletMouseEvent) => void): this;
    remove(): void;
  }

  export interface Marker {
    setLatLng(latLng: [number, number]): this;
    addTo(map: Map): this;
  }

  export interface LeafletMouseEvent {
    latlng: LatLng;
  }

  export interface TileLayer {
    addTo(map: Map): this;
  }

  export function map(elementId: string): Map;
  export function marker(latLng: [number, number]): Marker;
  export function tileLayer(urlTemplate: string, options: { attribution: string }): TileLayer;
}

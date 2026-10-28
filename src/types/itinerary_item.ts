export interface RawItineraryItem {
    summary: string;
    type: string;
    location: string;
    start: string;
    end: string;
    background_url: string;
    description: string;
    id: number;
}
export interface ItineraryItem {
    summary: string;
    type: string;
    location: string;
    start: Date;
    end: Date;
    background_url: string;
    description: string;
    id: number;
}
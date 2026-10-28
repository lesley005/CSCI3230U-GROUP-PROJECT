import { createRoot } from "react-dom/client";
import { ItineraryItem, RawItineraryItem } from "../types/itinerary_item";
import { useState } from "react";

export function read_itinerary(): ItineraryItem[] {
    let itinerary_raw_array = localStorage.getItem("itinerary")
    if(!itinerary_raw_array)
        return []

    let raw_item: RawItineraryItem[] = JSON.parse(itinerary_raw_array);
    let id_count = 0;
    return raw_item.map((item) => ({
        summary: item.summary,
        type: item.type,
        location: item.location,
        start: new Date(item.start),
        end: new Date(item.end),
        background_url: item.background_url,
        description: item.description ? item.description : " ",
        id: id_count++
    }))
}
export function Itinerary(): React.JSX.Element {
    const [itinerary, set_itinerary] = useState(read_itinerary)
    const [selected_filter, set_selected_filter] = useState("All types")
    const type_filters = ["All types", ...new Set(itinerary.map((item) => item.type))]
    localStorage.setItem("itinerary", JSON.stringify(itinerary));

    return itinerary.length > 0 ? (
        <section>
            <div id="itinerary_type_filter_container">
                <label htmlFor="itinerary_type_filter">Type</label>
                <select id="itinerary_type_filter" onChange={(event) => set_selected_filter(event.target.value)}>
                    {type_filters.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>
            <div id="itinerary_events">
                {itinerary.filter(item => selected_filter === "All types" || selected_filter === item.type).map((item) => (
                    <div className="itinerary_item" key={item.id}>
                        <div className="itinerary_item_header">
                            <span className="itinerary_item_title"><b>{item.summary}</b></span>
                            <span className="itinerary_item_type">{item.type}</span>
                        </div><div className="itinerary_item_body">
                                <span className="itinerary_item_notes">{item.description}</span>
                            </div><div className="itinerary_item_footer">
                                <span className="itinerary_item_location">{item.location}</span>
                                <span className="itinerary_item_date">{item.start.getDate() === item.end.getDate() ? `${item.start.toLocaleDateString()} ${item.start.toLocaleTimeString()} - ${item.end.toLocaleTimeString()}` : `${item.start.toLocaleString()} - ${item.end.toLocaleString()}`}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    ) : (
        <section>
            <div id="itinerary_events">
            <div className="itinerary_item">
                <div className="itinerary_item_header">
                        <span className="itinerary_item_title"><b>Your itinerary is here!</b></span>
                        <span className="itinerary_item_type"></span>
                    </div>
                    <div className="itinerary_item_body">
                        <span className="itinerary_item_notes">You can add places and events to your itinerary from their respective page</span>
                    </div>
                    <div className="itinerary_item_footer">
                        <span className="itinerary_item_location"></span>
                        <span className="itinerary_item_date"></span>
                    </div>
            </div>
            </div>
        </section>
    )
}
createRoot(document.getElementById("itinerary_body")!).render(
    <Itinerary></Itinerary>
)
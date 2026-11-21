import { ItineraryItem, RawItineraryItem } from "../types/itinerary_item";
import { useState } from "react";

export function read_itinerary(): ItineraryItem[] {
    let itinerary_raw_array = localStorage.getItem("itinerary")
    if(!itinerary_raw_array)
        return []

    let raw_item: RawItineraryItem[] = JSON.parse(itinerary_raw_array);
    return raw_item.map((item) => ({
        summary: item.summary,
        type: item.type,
        location: item.location,
        start: new Date(item.start),
        end: new Date(item.end),
        background_url: item.background_url,
        description: item.description ? item.description : " ",
        id: item.id
    }))
}
export function add_itinerary_item(item: ItineraryItem){
    let events: ItineraryItem[] = read_itinerary()
    localStorage.setItem("itinerary", JSON.stringify([...events, item]))
}

export function format_date_as_ical(date:Date){
    let date_string = `${date.getFullYear().toString().padStart(4, "0")}${date.getMonth().toString().padStart(2, "0")}${date.getDay().toString().padStart(2, "0")}`
    let time_string = `${date.getHours().toString().padStart(2, "0")}${date.getMinutes().toString().padStart(2, "0")}${date.getSeconds().toString().padStart(2, "0")}`
    return `${date_string}T${time_string}Z`
}

export function ical_event(item: ItineraryItem){
        let content = 
`BEGIN:VEVENT
UID:${item.id}
DTSTAMP:${format_date_as_ical(item.start)}
DTSTART:${format_date_as_ical(item.start)}
DTEND:${format_date_as_ical(item.end)}
SUMMARY:${item.summary}
LOCATION:${item.location}
DESCRIPTION:${item.description}
END:VEVENT`
        return content
}
export function generate_ical(items: ItineraryItem[]){
        let content = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Journeys Uncharted//Itinerary
${items.map((item) => ical_event(item)).join("\n")}
END:VCALENDAR`
        return content
    }
export function export_as_ical(items: ItineraryItem[]){
    let text = generate_ical(items)
    const dummy = document.createElement("a")
    dummy.href = window.URL.createObjectURL(new Blob([text], {type: "text/plain"}))
    dummy.setAttribute("download", "Journeys Uncharted Itinerary.ics")
    document.body.appendChild(dummy)
    dummy.click()
    window.URL.revokeObjectURL(dummy.href)
    document.body.removeChild(dummy)
}
export function ItineraryPage(): React.JSX.Element {
    const [itinerary, set_itinerary] = useState(read_itinerary)
    const [add_event_form_visible, set_event_form_visible] = useState(false)
    function add_itinerary_item(item: ItineraryItem){
        let updated = [...itinerary, item]
        set_itinerary(updated)
        localStorage.setItem("itinerary", JSON.stringify(updated))
    }
    function on_add_item_submit(event: React.SubmitEvent<HTMLFormElement>){
        console.log("test")
        event.preventDefault()
        let data = new FormData(event.target);
        let new_event: ItineraryItem = {
            summary: data.get("name") as string,
            type: data.get("type") as string,
            description: data.get("description") as string,
            location: data.get("location") as string,
            start: new Date(data.get("start") as string),
            end: new Date(data.get("end") as string),
            background_url: "",
            id: crypto.randomUUID()
        };
        add_itinerary_item(new_event)
        event.target.reset()
    }
    return (
        <section>
            <ItineraryAddEventForm onSubmit={on_add_item_submit} onClose={() => {
                set_event_form_visible(false)
            }} visible={add_event_form_visible}></ItineraryAddEventForm>
            <ItineraryEventList itinerary={itinerary}></ItineraryEventList>
            <div onClick={() => 
                {
                    if(!add_event_form_visible) {
                        set_event_form_visible(true)
                    }
                }} id="add_custom_itinerary_event">
                <span>+</span>
            </div>
            <input type="button" onClick={() =>{
                console.log(export_as_ical(itinerary))
            }} value="Download"/>
        </section>
    )
}
interface ItineraryAddEventFormProps{
    onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void,
    onClose: () => void,
    visible: boolean
}
function ItineraryAddEventForm({onSubmit, onClose, visible} : ItineraryAddEventFormProps){
    return visible ? (
        <form id="create_itinerary_event_form" className="shown" onSubmit={onSubmit}>
            <div className="create_event_form_section">
                <label htmlFor="create_event_name">Name</label>
                <input type="text" id="create_event_name" name="name" required/>
            </div>
            <div className="create_event_form_section">
                <label htmlFor="create_event_type">Type</label>
                <input type="text" id="create_event_type" name="type" required/></div>
            <div className="create_event_form_section">
                <label htmlFor="create_event_description">Description</label>
                <input type="text" id="create_event_description" name="description" required/>
            </div>
            <div className="create_event_form_section">
                <label htmlFor="create_event_location">Location</label>
                <input type="text" id="create_event_location" name="location"/>
            </div>
            <div className="create_event_form_section">
                <label htmlFor="create_event_date">Start</label>
                <input type="datetime-local" defaultValue={new Date().toISOString().substring(0,16)} id="create_event_date" name="start" required/>
            </div>
            <div className="create_event_form_section">
                <label htmlFor="create_event_date">End</label>
                <input type="datetime-local" defaultValue={new Date().toISOString().substring(0,16)} id="create_event_date" name="end"/>
            </div>
            <div className="create_event_form_section">
                <input id="create_event_close_button" value="Cancel" type="button" onClick={onClose}/>
                <input type="submit" id="create_event_submit" value="Add"/>
            </div>
        </form>
    ) : (<></>);
}
interface ItineraryListProps {
    itinerary: ItineraryItem[]
}
export function ItineraryEventList({itinerary}: ItineraryListProps): React.JSX.Element {
    const [selected_filter, set_selected_filter] = useState("All types")
    const type_filters = ["All types", ...new Set(itinerary.map((item) => item.type))]
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
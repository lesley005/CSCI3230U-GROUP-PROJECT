import { createRoot } from "react-dom/client";
import { ItineraryItem, RawItineraryItem } from "../types/itinerary_item";
import { useEffect, useState } from "react";
import "/itinerary.css"
import "/style.css"
export function read_itinerary(): ItineraryItem[] {
    let itinerary_raw_array = localStorage.getItem("itinerary")
    if (!itinerary_raw_array)
        return []
    try {
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
    } catch (err) {
      console.log(err)
      return []
    }
}
export function add_itinerary_item(item: ItineraryItem) {
    let events: ItineraryItem[] = read_itinerary()
    localStorage.setItem("itinerary", JSON.stringify([...events, item]))
}

export function delete_itinerary_item(item: ItineraryItem | string){
    let uuid = typeof(item) == "string" ? item : item.id
    let events: ItineraryItem[] = read_itinerary()
    localStorage.setItem("itinerary", JSON.stringify([...events.filter((event) => {return event.id !== uuid})]))
}

export function format_date_as_ical(date: Date) {
    let date_string = `${date.getFullYear().toString().padStart(4, "0")}${(date.getMonth()+1).toString().padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`
    let time_string = `${date.getHours().toString().padStart(2, "0")}${date.getMinutes().toString().padStart(2, "0")}${date.getSeconds().toString().padStart(2, "0")}`
    return `${date_string}T${time_string}Z`
}

export function ical_event(item: ItineraryItem) {
    let content = [`BEGIN:VEVENT`,
        `UID:${item.id}`,
        `DTSTAMP:${format_date_as_ical(item.start)}`,
        `DTSTART:${format_date_as_ical(item.start)}`,
        `DTEND:${format_date_as_ical(item.end)}`,
        `SUMMARY:${item.summary}`,
        `LOCATION:${item.location}`,
        `DESCRIPTION:${item.description}`,
        `END:VEVENT`].join("\r\n")
    return content
}
export function generate_ical(items: ItineraryItem[]) {
    let content = [`BEGIN:VCALENDAR`,
        `VERSION:2.0`,
        `PRODID:-//Journeys Uncharted//Itinerary`,
        `${items.map((item) => ical_event(item)).join("\r\n")}`,
        `END:VCALENDAR`].join("\r\n")
    return content
}
export function export_as_ical(items: ItineraryItem[]) {
    let text = generate_ical(items)
    const dummy = document.createElement("a")
    dummy.href = window.URL.createObjectURL(new Blob([text], { type: "text/plain" }))
    dummy.setAttribute("download", "Journeys Uncharted Itinerary.ics")
    document.body.appendChild(dummy)
    dummy.click()
    window.URL.revokeObjectURL(dummy.href)
    document.body.removeChild(dummy)
}
export function ItineraryPage(): React.JSX.Element {
    const [itinerary, set_itinerary] = useState(read_itinerary)
    const [current_search, set_search] = useState("")
    const [current_type_filter, set_selected_filter] = useState("All types")
    const type_filters = ["All types", ...new Set(itinerary.map((item) => item.type))]
    function add_itinerary_item(item: ItineraryItem) {
        let updated = [...itinerary, item]
        set_itinerary(updated)
        localStorage.setItem("itinerary", JSON.stringify(updated))
    }
    function on_add_item_submit(event: React.SubmitEvent<HTMLFormElement>) {
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
    function on_delete_event(item: ItineraryItem | string){
        let uuid = typeof(item) == "string" ? item : item.id
        let updated = itinerary.filter((event) => event.id !== uuid)
        set_itinerary(updated)
        localStorage.setItem("itinerary", JSON.stringify(updated))
    }
    useEffect(() => {
      let update = () => {
          console.log("Updating itinerary")
          set_itinerary(read_itinerary())
          window.removeEventListener("itinerary_updated", update)
      }
      window.addEventListener("itinerary_updated", update)
    }, [])
  return (
      <main className="itinerary-main">
        <section className="itinerary-intro">
        <h1 id="itinerary-title">Plan your trip!</h1>
        <p>
          Keep track of events and places you've scheduled!
        </p>

        <div className="itinerary-filters">
          <div className="itinerary-field">
            <label htmlFor="searchbar">Search itinerary</label>
            <input
              id="searchbar"
              type="search"
              placeholder="Search for an event"
              value={current_search}
            onChange={(event) => {
              set_search(event.target.value)
            }}
            />
          </div>
          <div className="itinerary-field">
            <label htmlFor="itinerary-country">Type</label>
            <select
              id="itinerary-type-filter"
              value={current_type_filter}
              onChange={(event) => set_selected_filter(event.target.value)}
            >
              {type_filters.map((type) => (
                  <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

        </div>
        <ItineraryEventList itinerary={itinerary} onDelete={on_delete_event} search_filter={current_search} type_filter={current_type_filter}></ItineraryEventList>
          <button id="itinerary_download_button" className="itinerary-button" onClick={() => {
              console.log(export_as_ical(itinerary))
          }}>
            Download
          </button>
          <div onClick={() => {
              show_add_event_form()
          }} id="add_custom_itinerary_event">
              <span>+</span>
          </div>

        </section>
      </main>
    )
}
interface ItineraryAddEventFormProps {
    onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void,
    onClose: () => void,
    defaultValues?: Partial<ItineraryItem>
}

function ItineraryAddEventForm({ onSubmit, onClose, defaultValues}: ItineraryAddEventFormProps) {
    return (
        <form id="create_itinerary_event_form" className="shown" onSubmit={onSubmit}>
            <div className="create_event_form_section">
                <label htmlFor="create_event_name">Name</label>
                <input type="text" id="create_event_name" name="name" required defaultValue={defaultValues?.summary ?? ""}/>
            </div>
            <div className="create_event_form_section">
                <label htmlFor="create_event_type">Type</label>
                <input type="text" id="create_event_type" name="type" required defaultValue={defaultValues?.type ?? ""}/></div>
            <div className="create_event_form_section">
                <label htmlFor="create_event_description">Description</label>
                <input type="text" id="create_event_description" name="description" required defaultValue={defaultValues?.description ?? ""}/>
            </div>
            <div className="create_event_form_section">
                <label htmlFor="create_event_location">Location</label>
                <input type="text" id="create_event_location" name="location" defaultValue={defaultValues?.location ?? ""}/>
            </div>
            <div className="create_event_form_section">
                <label htmlFor="create_event_date_start">Start</label>
                <input type="datetime-local" defaultValue={defaultValues?.start?.toISOString().substring(0, 16) ?? new Date().toISOString().substring(0, 16)} id="create_event_date_start" name="start" required />
            </div>
            <div className="create_event_form_section">
                <label htmlFor="create_event_date_end">End</label>
                <input type="datetime-local" defaultValue={defaultValues?.end?.toISOString().substring(0, 16) ?? new Date().toISOString().substring(0, 16)} id="create_event_date_end" name="end" />
            </div>
            <div className="create_event_form_section">
                <input id="create_event_close_button" value="Cancel" type="button" onClick={onClose} />
                <input type="submit" id="create_event_submit" value="Add" />
            </div>
        </form>
    );
}
// AI-generated code (Hydrogen Thinking 4 Education): See AI-USAGE.md entry #3
export function show_add_event_form(
    defaults?: Partial<ItineraryItem>,
): void {
    if(document.getElementById("event_creation_dialog") != undefined){
        return
    }
    const container = document.createElement("div");
    container.id = "event_creation_dialog"
    document.body.appendChild(container);
    const root = createRoot(container);

    const cleanup = () => {
        root.unmount();
        container.remove();
    };

    const handle_submit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const start_date = new Date(data.get("start") as string);
        const end_raw = data.get("end") as string;

        const new_event: ItineraryItem = {
            summary: data.get("name") as string,
            type: data.get("type") as string,
            description: data.get("description") as string,
            location: data.get("location") as string,
            start: start_date,
            end: end_raw ? new Date(end_raw) : start_date,
            background_url: defaults?.background_url ?? "",
            id: crypto.randomUUID()
        };

        add_itinerary_item(new_event);
        window.dispatchEvent(new Event("itinerary_updated"));
        cleanup();
    };

    root.render(
        <ItineraryAddEventForm
            defaultValues={defaults}
            onSubmit={handle_submit}
            onClose={cleanup}
        />
    );
}
// End AI-code

interface ItineraryListProps {
    itinerary: ItineraryItem[],
    onDelete: (item: ItineraryItem | string) => void
    type_filter: string,
    search_filter: string
}
export function ItineraryEventList({ itinerary, onDelete, type_filter, search_filter}: ItineraryListProps): React.JSX.Element {
    return itinerary.length > 0 ? (
        <section>
            <div id="itinerary_events">
                {itinerary.filter(item => type_filter === "All types" || type_filter === item.type).filter(item => item.summary.toLowerCase().indexOf(search_filter.toLowerCase()) != -1).map((item) => (
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
                        <span className="itinerary_delete_icon" title="Delete" onClick={() => {onDelete(item.id)}}>
                            &times;
                        </span>
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
export default ItineraryPage;
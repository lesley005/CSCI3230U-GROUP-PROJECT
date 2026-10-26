import { ItineraryItem, RawItineraryItem } from "../types/itinerary_item";
let itinerary: ItineraryItem[] = []
let list: HTMLDivElement = document.getElementById("itinerary_events")! as HTMLDivElement
let type_filter: HTMLSelectElement = document.getElementById("itinerary_type_filter")! as HTMLSelectElement
let selected_filter: string = "All types"
function generate_html_list(){
    if(list == null || type_filter == null){
        // This should never happen
        console.error("Failed")
        return
    }
    list.innerHTML = ""
    for(let item of itinerary){
        if(selected_filter == "All types" || selected_filter === item.type){
            console.log(`Adding item to DOM: ${item.summary}`)
            let div = document.createElement("div")
            div.className = "itinerary_item"
            div.innerHTML = `
                <div class="itinerary_item_header">
                    <span class="itinerary_item_title"><b>${item.summary}</b></span>
                    <span class="itinerary_item_type">${item.type}</span>
                </div>
                <div class="itinerary_item_body">
                    <span class="itinerary_item_notes">${item.description}</span>
                </div>
                <div class="itinerary_item_footer">
                    <span class="itinerary_item_location">${item.location}</span>
                    <span class="itinerary_item_date">${item.start.getDate() === item.end.getDate() ? `${item.start.toLocaleDateString()} ${item.start.toLocaleTimeString()} - ${item.end.toLocaleTimeString()}` : `${item.start.toLocaleString()} - ${item.end.toLocaleString()}`}</span>
                </div>
            `
            list.appendChild(div)
        }
    }
}
function load_itinerary(){
    let itinerary_raw_array = localStorage.getItem("itinerary")
    if(!itinerary_raw_array)
        return

    type_filter.innerHTML = ""
    let type_filters = new Set<string>()
    type_filters.add("All types")

    let raw_item: RawItineraryItem[] = JSON.parse(itinerary_raw_array);
    itinerary = raw_item.map((item) => ({
        summary: item.summary,
        type: item.type,
        location: item.location,
        start: new Date(item.start),
        end: new Date(item.end),
        background_url: item.background_url,
        description: item.description ? item.description : " ",
    }))

    for(let item of itinerary){
        type_filters.add(item.type)
    }
    
    for(let type of type_filters){
        let option = document.createElement("option")
        option.text = type
        type_filter.add(option)
    }
    type_filter.addEventListener("change", (event) => {
        console.log(type_filter.value)
        selected_filter = type_filter.value
        generate_html_list()
    })
    generate_html_list()
}
function save_itinerary(){
    localStorage.setItem("itinerary", JSON.stringify(itinerary));
}
load_itinerary()
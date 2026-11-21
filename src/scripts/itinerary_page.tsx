import { createRoot } from "react-dom/client";
import { ItineraryPage } from "./itinerary";

function render_itinerary(){
    let root = createRoot(document.getElementById("itinerary_body")!);
    root.render(
        <ItineraryPage></ItineraryPage>
    )
}
render_itinerary()
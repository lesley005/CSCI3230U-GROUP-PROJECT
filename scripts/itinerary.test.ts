import { beforeEach, describe, expect, test, vi } from "vitest"
import { add_itinerary_item, read_itinerary, format_date_as_ical, ical_event, generate_ical } from "../src/scripts/itinerary"
import { ItineraryItem } from "../src/types/itinerary_item"
describe("LocalStorage", () => {
    const fake_localstorage = (() => {
        let data: Record<string,string> = {}
        function setItem(key:string, value:string){
            data[key] = value
        }
        function getItem(key:string){
            return data[key]
        }
        function clear(){
            data = {}
        }
        return {setItem, getItem, clear}
    })()

    vi.stubGlobal("localStorage", fake_localstorage)

    beforeEach(()=>{localStorage.clear()})
    test("Empty itinerary returns []", () => {
        let read = read_itinerary()
        expect(read).toEqual([])
    })
    test("Can set itinerary data", () => {
        let test_data = '[{"background_url":"","description":"A very long description goes here","location":"This is a location","summary":"A new event that is added","type":"Test Event","id":"5753ff90-5aac-427a-9212-5f0c8ba0feff","start":"2026-05-08T16:30:42.000Z","end":"2026-05-08T06:00:00.000Z"}]'
        localStorage.setItem("itinerary", test_data)
        expect(localStorage.getItem("itinerary")).not.toEqual("[]")
    })
    test("Can get itinerary data", () => {
        let test_data = '[{"background_url":"","description":"A very long description goes here","location":"This is a location","summary":"A new event that is added","type":"Test Event","id":"5753ff90-5aac-427a-9212-5f0c8ba0feff","start":"2026-05-08T16:30:42.000Z","end":"2026-05-08T06:00:00.000Z"}]'
        localStorage.setItem("itinerary", test_data)
        expect(localStorage.getItem("itinerary")).toEqual(test_data)
    })
    test("Can add item", ()=>{
        let test_event: ItineraryItem = {
            background_url: "",
            description: "A very long description goes here",
            location: "This is a location",
            summary: "A new event that is added",
            type: "Test Event",
            id: "7d85308f-6248-4348-8f46-f345f9a3aad2",
            start: new Date(2026, 4, 8, 12, 30, 42),
            end: new Date(2026, 4, 8, 2, 0, 0)
        }
        add_itinerary_item(test_event)
    })
    test("Can retrieve item", ()=>{
        let test_event: ItineraryItem = {
            background_url: "",
            description: "A very long description goes here",
            location: "This is a location",
            summary: "A new event that is added",
            type: "Test Event",
            id: "7d85308f-6248-4348-8f46-f345f9a3aad2",
            start: new Date(2026, 4, 8, 12, 30, 42),
            end: new Date(2026, 4, 8, 2, 0, 0)
        }
        add_itinerary_item(test_event)
        let read = read_itinerary()
        expect(read).toEqual([test_event])
    })
})
describe("iCal", () => {
    test("Date formats correctly", () => {
        expect(format_date_as_ical(new Date(2026, 4, 8, 12, 30, 42))).toEqual("20260405T123042Z")
    })
    test("Itinerary event formats correctly", () => {
        let test_event: ItineraryItem = {
            background_url: "",
            description: "A very long description goes here",
            location: "This is a location",
            summary: "A new event that is added",
            type: "Test Event",
            id: "7d85308f-6248-4348-8f46-f345f9a3aad2",
            start: new Date(2026, 4, 8, 12, 30, 42),
            end: new Date(2026, 4, 8, 2, 0, 0)
        }
        let ical_event_string = ical_event(test_event)
        let expected = `BEGIN:VEVENT
UID:7d85308f-6248-4348-8f46-f345f9a3aad2
DTSTAMP:20260405T123042Z
DTSTART:20260405T123042Z
DTEND:20260405T020000Z
SUMMARY:A new event that is added
LOCATION:This is a location
DESCRIPTION:A very long description goes here
END:VEVENT`
        expect(ical_event_string).toEqual(expected)
    })
    test("Itinerary list formats correctly", () => {
        let test_event_1: ItineraryItem = {
            background_url: "",
            description: "A very long description goes here",
            location: "This is a location",
            summary: "A new event that is added",
            type: "Test Event",
            id: "7d85308f-6248-4348-8f46-f345f9a3aad2",
            start: new Date(2026, 4, 8, 12, 30, 42),
            end: new Date(2026, 4, 8, 2, 0, 0)
        }
        let test_event_2: ItineraryItem = {
            background_url: "",
            description: "Another very long description goes here",
            location: "This is another location",
            summary: "Another event that is added",
            type: "Test Event",
            id: "f9aeb088-9c87-4b86-beb3-a3350e765c21",
            start: new Date(2026, 4, 8, 12, 30, 42),
            end: new Date(2026, 4, 8, 2, 0, 0)
        }
        add_itinerary_item(test_event_1)
        add_itinerary_item(test_event_2)
        let expected = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Journeys Uncharted//Itinerary
BEGIN:VEVENT
UID:7d85308f-6248-4348-8f46-f345f9a3aad2
DTSTAMP:20260405T123042Z
DTSTART:20260405T123042Z
DTEND:20260405T020000Z
SUMMARY:A new event that is added
LOCATION:This is a location
DESCRIPTION:A very long description goes here
END:VEVENT
BEGIN:VEVENT
UID:7d85308f-6248-4348-8f46-f345f9a3aad2
DTSTAMP:20260405T123042Z
DTSTART:20260405T123042Z
DTEND:20260405T020000Z
SUMMARY:A new event that is added
LOCATION:This is a location
DESCRIPTION:A very long description goes here
END:VEVENT
BEGIN:VEVENT
UID:f9aeb088-9c87-4b86-beb3-a3350e765c21
DTSTAMP:20260405T123042Z
DTSTART:20260405T123042Z
DTEND:20260405T020000Z
SUMMARY:Another event that is added
LOCATION:This is another location
DESCRIPTION:Another very long description goes here
END:VEVENT
END:VCALENDAR`
        let read = read_itinerary()
        let ical_string = generate_ical(read)
        expect(ical_string).toEqual(expected)
    })
    test.todo("Test downloading .iCal file")
})
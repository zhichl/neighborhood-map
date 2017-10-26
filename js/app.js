/* global google, mapStyles, locations, ko*/

// import { mapStyles } from "./views/map_styles.js"

let viewModel

class ViewModel {
	constructor(map, locations) {
		this.places = getPlaces(map, locations)
		this.displayingList = this.places
	}

	filter(content) {
		let results = ko.observable([])
		for(let place of this.places()) {
			const matched = place().checkMatch(content)
			if(matched) {
				results().push(place)
			} 
		}

		return results
	}

}

class Place {
	constructor(map, location) {
		// this.name = ko.observable(location.name)
		this.name = location.name
		this.address = location.address
		this.position = location.position
		this.types = location.types
		this.placeID = location.placeID
		this.marker = new google.maps.Marker({
			position: this.position,
			map: map
		})
	}

	checkMatch(content) {
		// TODO: test invalid string

	}

}

function getPlaces(map, locations) {
	let places = ko.observable([])
	for (let loc of locations) {
		places().push(ko.observable(new Place(map, loc)))
	}
	return places
}

function initViewModel(map, locations) {
	viewModel = new ViewModel(map, locations)
	ko.applyBindings(viewModel)
}

function initMap() {
	const palceOfFineArtsTheatre = {
		lat: 37.801991,
		lng: -122.448656
	}
	const map = new google.maps.Map(document.getElementById("map-view"), {
		zoom: 14,
		center: palceOfFineArtsTheatre,
		styles: mapStyles
	})

	initViewModel(map, locations)
}
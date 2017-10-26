/* global google, mapStyles, locations, ko*/

// import { mapStyles } from "./views/map_styles.js"

let viewModel

class ViewModel {
	constructor(locations) {
		this.places = getPlaces(locations)
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
	constructor(location) {
		// this.name = ko.observable(location.name)
		this.name = location.name
		this.address = location.address
		this.position = location.position
		this.types = location.types
		this.placeID = location.placeID
	}

	checkMatch(content) {
		// TODO: test invalid string

	}

}

function getPlaces(locations) {
	let places = ko.observable([])
	for (let loc of locations) {
		places().push(ko.observable(new Place(loc)))
	}
	return places
}

function initViewModel() {
	viewModel = new ViewModel(locations)
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

	let markers = []
	for (let place of viewModel.places()) {
		markers.push(new google.maps.Marker({
			position: place().position,
			map: map
		}))
	}

	viewModel();
}
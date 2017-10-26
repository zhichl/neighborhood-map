/* global google, mapStyles, locations, ko*/

// import { mapStyles } from "./views/map_styles.js"

let viewModel

class ViewModel {
	constructor(locations) {
		this.places = getPlaces(locations)
	}
}

class Place {
	constructor(location) {
		this.name = ko.observable(location.name)
		this.address = ko.observable(location.address)
		this.position = ko.observable(location.position)
		this.types = ko.observable(location.types)
		this.placeID = ko.observable(location.placeID)
	}
}

initApp()

function getPlaces(locations) {
	let places = ko.observable([])
	for (let loc of locations) {
		places().push(ko.observable(new Place(loc)))
	}
	return places
}

function initApp() {
	viewModel = new ViewModel(locations)
	ko.applyBindings(viewModel)
}

function initMap() {
	const sfMarinaMiddleSchool = {
		lat: 37.801739,
		lng: -122.436123
	}
	const map = new google.maps.Map(document.getElementById("map-view"), {
		zoom: 14,
		center: sfMarinaMiddleSchool,
		styles: mapStyles
	})

	let markers = []
	for (let place of viewModel.places()) {
		markers.push(new google.maps.Marker({
			position: place().position(),
			map: map
		}))
	}
}
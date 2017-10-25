/* global google, mapStyles, locations, ko*/

// import { mapStyles } from "./views/map_styles.js"

function initMap() {
	const sf = {lat: 37.77493, lng: -122.419416}
	const map = new google.maps.Map(document.getElementById("map"), {
		zoom: 14,
		center: sf,
		styles: mapStyles
	})
	const marker = new google.maps.Marker({
		position: sf,
		map: map
	})
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

class ViewModel {
	constructor(locations) {
		this.places = getPlaces(locations)
	}
}

function getPlaces(locations) {
	let places = ko.observable([])
	for(let loc of locations) {
		places.push(ko.observable(new Place(loc)))
	}
	return places
}


function initApp() {
	const viewModel = new ViewModel(locations)
	ko.applyBindings(viewModel)
}



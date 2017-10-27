/* global google, mapStyles, locations, ko*/
"use strict"
// import { mapStyles } from "./views/map_styles.js"

let viewModel

class ViewModel {
	constructor(map, locations) {
		this.places = getPlaces(map, locations)
		this.filterInput = ""
	}

	filter() {
		for(let place of this.places()) {
			// console.log(this.filterInput)
			const matched = place().checkMatch(this.filterInput)
			// match the filter content
			if(matched) {
				// console.log(`name: ${place().name}, show: ${place().show}`)
				place().show(true)
				place().showMarker()
			// doens't match
			} else {
				place().show(false)
				place().hideMarker()
			}
		}
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
		this.show = ko.observable(true)
	}

	checkMatch(content) {
		let matched = (false || content === "")
		if (content !== "") {
			matched = this.name.toLowerCase().includes(content.toLowerCase())
		}
		return matched
	}

	showMarker() {
		this.marker.setVisible(true)
	}

	hideMarker() {
		this.marker.setVisible(false)
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
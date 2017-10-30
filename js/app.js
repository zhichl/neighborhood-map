/* global google, mapStyles, locations, ko*/
"use strict"
// import { mapStyles } from "./views/map_styles.js"

let viewModel

class ViewModel {
	constructor(map, locations) {
		this.places = getPlaces(map, locations, this)
		this.filterInput = ""
		this.currentPlaceID = null
		this.currentPlaceChanged = false
		this.infoWindow = new google.maps.InfoWindow({
			content: 'Test',
			// disableAutoPan: true
		})
		this.mapOpacity = ko.observable("opacityNormal")
	}

	filter() {
		for(let place of this.places()) {
			// console.log(this.filterInput)
			const matched = place().checkMatch(this.filterInput)
			// match the filter content
			if(matched) {
				place().showInList(true)
				place().showMarker()
			// doens't match
			} else {
				place().showInList(false)
				place().hideMarker()
			}
		}
	}

	setInfoWindow(place) {
		// if current place changed, make a new request and set new content
		if(this.currentPlaceChanged) {
			this.infoWindow.setContent(`<h3> ${place.name} </h3>`)
		} else {
			console.log("same place")
		}
	}

	focusPlace(place) {
		if(this.currentPlaceID === place.placeID) {
			this.currentPlaceChanged = false
		} else {
			this.currentPlaceID = place.placeID
			this.currentPlaceChanged = true
		}
		
	}

	// toggleMapDim() {
	// 	if(this.mapOpacity() === "opacityNormal") {
	// 		this.mapOpacity("opacityDim")
	// 	} else {
	// 		this.mapOpacity("opacityNormal")
	// 	}
	// }

}

class Place {
	constructor(map, location, viewModel) {
		this.map = map
		this.viewModel = viewModel
		this.name = location.name
		this.address = location.address
		this.position = location.position
		this.types = location.types
		this.placeID = location.placeID
		this.marker = new google.maps.Marker({
			position: this.position,
			map: map,
			animation: google.maps.Animation.DROP
		})
		this.showInList = ko.observable(true)

		this.marker.addListener("click", () => {
			this.focus()
			// when clicked, marker bounces once 
			bounceOnce(this.marker)
			// viewModel.toggleMapDim()
			this.showInfoWindow()
		})
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

	onListClick() {
		this.focus()
		// when clicked, marker bounces once 
		bounceOnce(this.marker)
		this.showInfoWindow()
	}

	focus() {
		this.map.setCenter(this.position)
		this.viewModel.focusPlace(this)
	}

	showInfoWindow() {
		this.viewModel.setInfoWindow(this)
		this.viewModel.infoWindow.open(this.map, this.marker)
	}

}

function getPlaces(map, locations, viewModel) {
	let places = ko.observable([])
	for (let loc of locations) {
		places().push(ko.observable(new Place(map, loc, viewModel)))
	}
	return places
}

function initViewModel(map, locations) {
	viewModel = new ViewModel(map, locations)
	ko.applyBindings(viewModel)
}

function initMap() {
	const lombaStreet = {
		lat: 37.802139,
		lng: -122.41874
	}
	const map = new google.maps.Map(document.getElementById("map-view"), {
		zoom: 14,
		center: lombaStreet,
		styles: mapStyles
	})

	initViewModel(map, locations)
}

// marker bounces once in 700ms
function bounceOnce(marker) {
	marker.setAnimation(google.maps.Animation.BOUNCE)
	setTimeout(() => {
		marker.setAnimation(null)
	}, 700)
}

// fetch photos from Flickr, using Flickr API
function getPhotos(place) {
	const flickrAPI = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=48b43a42e4a2b9136fd55678f58ddc3e&text=${place.name}&sort=relevance&per_page=20&format=json&nojsoncallback=1`
	const config = {
		url: flickrAPI,

	}
	
	$.ajax(config).done().fail()
}

function addPhotos() {

}
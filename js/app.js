/* global google, mapStyles, locations, ko*/
"use strict"
// import { mapStyles } from "./views/map_styles.js"

let viewModel

class ViewModel {
	constructor(map, locations) {
		this.map = map
		this.places = getPlaces(map, locations, this)
		this.filterInput = ""
		this.currentPlaceID = null
		this.currentPlaceChanged = false
		this.infoWindow = new google.maps.InfoWindow({
			disableAutoPan: true
		})
		this.mapOpacity = ko.observable("opacity-normal")
	}

	filter() {
		this.infoWindow.close()
		let showPlaces = []
		for(let place of this.places()) {
			// console.log(this.filterInput)
			const matched = place().checkMatch(this.filterInput)
			// match the filter content
			if(matched) {
				showPlaces.push(place())
				place().showInList(true)
				place().showMarker()
			// doens't match
			} else {
				place().showInList(false)
				place().hideMarker()
			}
		}
		
		// dynamically pan the map to the center of displaying places
		if(showPlaces.length > 0) {
			const averagePosition = calAveragePosition(showPlaces)
			this.map.panTo(averagePosition)
		}
	}

	setInfoWindow(place) {
		// if current place changed, get new request and set new content
		// info contents are automatically cached by browser
		if(this.currentPlaceChanged) {
			const infoWindowHTML = this.getInfoWindowHTML(place)
			this.infoWindow.setContent(infoWindowHTML)
			this.addPhotos(place)
		}
	}

	getInfoWindowHTML(place) {
		const content = 
		`<div class="info-window-content"> 
			<h3>${place.name}</h3>
			<div class="flickr-content">
				<p class="flickr-discription"></p>
			</div>
		</div>`
		return content
	}

	addPhotos(place) {
		// fetch photos from Flickr, using flickr.photos.search API method
		// returns the first search result page with keyword of place name, 20 photos per-page
		const flickrAPI = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=e3b686486ab791a3710f892b7e5055c0&text=${place.name}&sort=relevance&per_page=20&page=1&format=json&nojsoncallback=1`
		const config = {
			url: flickrAPI
		}
		$.ajax(config)
			.done((data) => {
				console.log(data)
				const photos = data.photos.photo
				const singlePhoto = photos[2]
				const imgURL = getFlikrImgURL(singlePhoto)
				const pageURL = getFlikrWebPageURL(singlePhoto)
				$(".flickr-content").append(`<img class="flickr-img" alt="No photo from Flickr.com" src=${imgURL}>`)
				$(".flickr-discription").html(`Click <a href=${pageURL} target="_blank">here</a> to see more about the photo`)
			})
			.fail(() => {
				$(".flickr-discription").text("Failed to fetch photos from Flickr.com, please reload the page")
			})
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
	// 	if(this.mapOpacity() === "opacity-normal") {
	// 		this.mapOpacity("opacity-dim")
	// 	} else {
	// 		this.mapOpacity("opacity-normal")
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
		// recenter the map by marker's position
		// use panTo() over setCenter() to add smooth transition effect and prevent reloading the map
		this.map.panTo(this.position)
		this.viewModel.focusPlace(this)
	}

	showInfoWindow() {
		this.viewModel.setInfoWindow(this)
		this.viewModel.infoWindow.open(this.map, this.marker)
	}

}

// called as callback when map finishes loading
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

function initViewModel(map, locations) {
	viewModel = new ViewModel(map, locations)
	ko.applyBindings(viewModel)
}

function getPlaces(map, locations, viewModel) {
	let places = ko.observable([])
	for (let loc of locations) {
		places().push(ko.observable(new Place(map, loc, viewModel)))
	}
	return places
}

// marker bounces once in 700ms
function bounceOnce(marker) {
	marker.setAnimation(google.maps.Animation.BOUNCE)
	setTimeout(() => {
		marker.setAnimation(null)
	}, 700)
}

function getFlikrImgURL(img) {
	let imgURL = ""
	if(img) {
		imgURL = `https://farm${img.farm}.staticflickr.com/${img.server}/${img.id}_${img.secret}.jpg`
	}
	return imgURL
}

function getFlikrWebPageURL(img) {
	let pageURL = ""
	if(img) {
		pageURL = `https://www.flickr.com/photos/${img.owner}/${img.id}`
	}
	return pageURL
}

function calAveragePosition(places) {
	let pos = {lat: 0, lng: 0}
	if(places.length > 0) {
		for(let place of places) {
			pos.lat += place.position.lat
			pos.lng += place.position.lng
		}
		pos.lat /= places.length
		pos.lng /= places.length
	}
	return pos
}
/* global google, mapStyles, locations, ko*/
let viewModel

// app view model
class ViewModel {
	constructor(map, locations) {
		this.map = map

		// the view port center corresponded on the map is not the same as the original map.center
		// init viewPortMapCenter as map.center, it can get updated by this.updateViewPortMapCenter()
		this.viewPortMapCenter = this.map.getCenter()

		this.places = getPlaces(map, locations, this)
		this.filterInput = ""
		this.currentPlaceID = null
		this.currentPlaceChanged = false
		this.infoWindow = new google.maps.InfoWindow({
			disableAutoPan: true
		})
		this.mapOpacity = ko.observable("opacity-normal")
		this.showList = ko.observable("")
		this.showListButton = ko.observable(false)
		this.responsiveWidth = 910
		this.smallScreenWidth = 500

		// adjust screen when initialized
		this.adjustScreen()

		// responsive
		google.maps.event.addDomListener(window, "resize", () => {
			this.map.panTo(this.viewPortMapCenter)
			this.adjustScreen()
		})

		// close info-window when clicking on the map
		google.maps.event.addListener(map, "click", () => {
			this.infoWindow.close()
		})
	}

	filter() {
		this.infoWindow.close()
		let showPlaces = []
		for(let place of this.places()) {
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
			this.updateViewPortMapCenter()
		}
	}

	setInfoWindow(place) {
		// if current place changed, get new request and set new content
		// info contents are automatically cached by browser
		if(this.currentPlaceChanged) {
			// fetch photos from Flickr, using flickr.photos.search API method
			// returns the first search result page with keyword of place name, 20 photos per-page
			const flickrAPI = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=e3b686486ab791a3710f892b7e5055c0&text=${place.name}&sort=relevance&per_page=20&page=1&format=json&nojsoncallback=1`
			const config = {
				url: flickrAPI
			}
			$.ajax(config)
				.done((data) => {
					const photos = data.photos.photo
					if(photos.length > 0) {		// ajax request succeeds and photos are returned
						const singlePhoto = photos[0],
							imgURL = getFlikrImgURL(singlePhoto),
							pageURL = getFlikrWebPageURL(singlePhoto),
							infoWindowHTML = this.getInfoWindowHTML(place.name, imgURL, pageURL)
							
						this.infoWindow.setContent(infoWindowHTML)
						// set img ULR and re-pan the map when photo is loaded
						$(".flickr-img").on("load", () => {
							this.panWithHeight($(".flickr-img").height())
							this.updateViewPortMapCenter()
						})
					} else {	// ajax request succeeds, but no photo returned
						const infoWindowHTML = this.getInfoWindowHTML(place.name)
						this.infoWindow.setContent(infoWindowHTML)
					}
				})
				// ajax request failed
				.fail(() => {
					const infoWindowHTML = this.getInfoWindowHTML()
					this.infoWindow.setContent(infoWindowHTML)
				})
		}		
	}

	// general method to generate info-window HTML by request results
	getInfoWindowHTML(placeName = null, imgURL = null, pageURL = null) {
		let altContent = "", 
			description = ""

		if(placeName === null) {	// ajax request failed
			description = "Failed to fetch photos from Flickr.com, please reload the page"
		} else if(imgURL === null) {	// request succeeds, but no photo from Flickr
			altContent = "No photo from Flickr.com"
		} else {	// request succeeds and photos are returned
			description = `Click <a href="${pageURL}" target="_blank">here</a> to see more about the photo`
		}

		const content = 
		`<div class="info-window-content"> 
			<h3>${placeName}</h3>
			<div class="flickr-content">
				<p class="flickr-description">${description}</p>
				<img class="flickr-img" alt="${altContent}" src="${imgURL}">
			</div>
		</div>`

		return content
	}

	// focus the place to the center of the map
	// // use panTo() over setCenter() to add smooth transition effect and prevent reloading the map
	focusPlace(place) {
		if(this.currentPlaceID === place.placeID) {
			this.currentPlaceChanged = false
		} else {
			this.currentPlaceID = place.placeID
			this.currentPlaceChanged = true
			this.map.panTo(place.position)
			this.updateViewPortMapCenter()
		}
	}

	// show / hide list toggle
	toggleList() {
		if(this.showList() === "showList" || this.showList() === "") {
			this.showList("hideList")
		} else {
			this.showList("showList")
		}
	}

	hideList() {
		this.showList("hideList")
	}

	// pan dynamically with height
	panWithHeight(height) {
		const offset = height * 0.75
		this.map.panBy(0, -offset)
	}

	// adjust the app interface by screen size
	adjustScreen() {
		this.adjustList()
		this.adjustListButton()
		this.adjustZoom()
	}

	// adjust list by screen size
	adjustList() {
		if($(window).width() < this.responsiveWidth) {
			this.showList("hideList")
		} else {
			this.showList("showList")
		}
	}

	// adjust list-button by screen size
	adjustListButton() {
		this.showListButton($(window).width() < this.responsiveWidth)
	}
	
	// adjust zooming level by screen size
	adjustZoom() {
		if($(window).width() < this.smallScreenWidth) {
			this.map.setZoom(13)
		} else {
			this.map.setZoom(14)
		}
	}

	// track view port center on the map
	updateViewPortMapCenter() {
		const 
			lat0 = this.map.getBounds().getSouthWest().lat(),
			lng0 = this.map.getBounds().getSouthWest().lng(),
			lat1 = this.map.getBounds().getNorthEast().lat(),
			lng1 = this.map.getBounds().getNorthEast().lng()

		this.viewPortMapCenter = {lat: (lat1 - lat0) / 2 + lat0, lng: (lng1 - lng0) / 2 + lng0}
	}

}

// place entry view model
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
			this.viewModel.adjustList()
			this.focus()
			// when clicked, marker bounces once 
			bounceOnce(this.marker)
			this.showInfoWindow()
		})
	}

	// match checking used by filter
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

	// called when list place entry is clicked
	onListClick() {
		this.viewModel.adjustList()
		this.focus()
		// when clicked, marker bounces once 
		bounceOnce(this.marker)
		this.showInfoWindow()
	}
	
	// recenter the map by the place's position
	focus() {
		this.viewModel.focusPlace(this)
	}

	showInfoWindow() {
		this.viewModel.adjustList()
		this.viewModel.setInfoWindow(this)
		this.viewModel.infoWindow.open(this.map, this.marker)
	}
}

// called as callback function when map completes loading
function initMap() {
	const lombaStreet = {
		lat: 37.802139,
		lng: -122.41874
	}
	const map = new google.maps.Map(document.getElementById("map-view"), {
		zoom: 14,
		center: lombaStreet,
		styles: mapStyles,
		mapTypeControl: false
	})

	initViewModel(map, locations)
}

function onMapError() {
	$("#map-view .map-view-message").text("Failed to load map, please reload the page")
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

// get the image file source URL
function getFlikrImgURL(img) {
	let imgURL = ""
	if(img) {
		imgURL = `https://farm${img.farm}.staticflickr.com/${img.server}/${img.id}_${img.secret}.jpg`
	}
	return imgURL
}

// get the image page URL
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
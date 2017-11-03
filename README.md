# SF Neighborhood Map

Demo: [here]( https://zhichl.github.io/neighborhood-map/)
This is a responsive single page application that contains a list of selected places to visit at San Francisco main city area.

## Instructions

To see details of a specific place and interact with the app, click on the markers on the map or the name entry on the left side list. On mobile devices or smaller screen, the left side list hides by default. Click the hamburger button on the top bar to show / hide the list. For filtering, type words in the filter bar to real-timely exclude the places you are not interested in both on the list and the map. 

## App Details

### I. Components

#### Models

| Data            | Notes                                    |
| --------------- | ---------------------------------------- |
| ```locations``` | Data consist of 10 distinct places in SF. Each of these places data has name, address, position, types and place ID of that place. |

#### Views

| Component             | Notes                                    |
| :-------------------- | :--------------------------------------- |
| ```top-bar```         | A top bar with app header and list show-hide button |
| ```map-view```        | The main map section host by Google Map  |
| ```place-list-view``` | A list that contains the names of places to visit |

#### View Models

| Class            | Notes                                    |
| ---------------- | ---------------------------------------- |
| ``` ViewModel``` | App view model, responsible for controlling interaction and the contents displaying on all views. |
| ```Place```      | View model for a single place entry. Handles clicking and displaying functions in both list-view and map-view together with the app view model. |

### II. Code Notes

Views are bound with app view model using Knockout bindings. Bindings include both one-way binding and two-way binding. A place marker is being focused to the center of the app if itself or the corresponding list entry gets clicked on. Photos of a specific place are fetched through the search method of Flickr APIs asynchronously, so they are not guaranteed to be the same every time user clicks list or markers. App interface is designed to perform responsively by browser window sizes or on different device screens.

### III. Dependencies

1. Knouckout.JS v3.4.2
2. JQuery v3.2.1
3. Google Map APIs v3
4. Flickr APIs

### IV. TODOs / Future works

1. Extend the filtering function to include place type keyword. Make it more content flexible with user input.
2. Add information about a place using other 3rd-party APIs such as Wikipedia and Yelp.
3. Add contents in the left list panel.
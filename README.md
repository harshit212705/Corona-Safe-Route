# Corona-Safe-Route
A Reactjs project which helps user decide the safest path from the multiple possible paths between source to destination taking into consideration the Covid cases and stats.

### APIs Used:-
* [Google Maps API](https://developers.google.com/maps)
* [COVID19-India API](https://api.covid19india.org/)
* [Open Disease Data](https://corona.lmao.ninja/)

### Project Setup
* **Step 1** - Clone this repository.
* **Step 2** - Run command **npm install** in the project directory.
* **Step 3** - Generate your Google Maps API key from [here](https://console.cloud.google.com/google/maps-apis/overview).
* **Step 4** - Now create a file with name **.env** at the same level as **package.json** file.
* **Step 5** - Add the following line to the file **.env**.
	```
	REACT_APP_GOOGLE_MAPS_API_KEY=<YOUR GOOGLE MAPS API KEY HERE>
	```
  
* **Step 6** - Now run **npm run start** and and the application will be started automatically. 

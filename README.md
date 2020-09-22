# Facebook Review
A web app based on react that randomly selects a photo to show to the whole room. Users are then allowed to add captions

## TODO 
- Finish selecting a random photo from fb profile. SHould maybe just do profile pics
- Need to fix the slide out of the game board
- Add User is broken fix that. Dont import User class to the States.js

## Loading FB Pictures Data Flow
- There is an accesstoken for the database and for facebook. 
- On entering room, load albums, and photos
- on choosing user check if photos present and load one
## BUGS
- Attaching listener to window on unload in the event causes this event to get fired even on the homepage.
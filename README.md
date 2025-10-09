Wanderlust
A full-stack web application built with Node.js, Express, EJS, Bootstrap, and MongoDB. Wanderlust allows users to explore destinations, authenticate accounts, upload images, and interact with maps (Leaflet integration).

Features
User authentication and session management

Interactive map with Leaflet/OpenStreetMap

Image upload functionality for destinations

Admin portal for moderation and data upload

Responsive design using Bootstrap

Dynamic pages rendered with EJS templating engine

Technologies Used
Node.js

Express.js

MongoDB (Mongoose)

EJS

Bootstrap

JavaScript

Leaflet

controllers/    # Route control logic
init/           # Initialization scripts
models/         # Mongoose models
public/         # Static files (CSS, JS, images)
routes/         # Express route definitions
uploads/        # Uploaded user files/images
utils/          # Helper functions
views/          # EJS templates
app.js          # Main server file
middleware.js   # Custom middleware
cloudConfig.js  # Cloud storage configuration
schema.js       # DB schematics
package.json    # Project dependencies

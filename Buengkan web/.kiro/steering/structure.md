# Project Structure & Organization

## Root Directory Layout
```
/
├── .kiro/              # Kiro configuration and steering
├── .vscode/            # VS Code settings
├── 1.png, 2.png, 3.png, 4.png  # Hero slideshow images
├── api.js              # API management and data handling
├── index.html          # Main application entry point
├── package.json        # Node.js dependencies and scripts
├── README.md           # Project documentation (Thai)
├── script.js           # Frontend JavaScript logic
├── server.js           # Express.js backend server
└── style.css           # Main stylesheet
```

## Architecture Patterns

### Frontend Structure
- **Single Page Application**: All content managed through JavaScript
- **Component-based Cards**: Reusable destination cards for all categories
- **Modal System**: Centralized modal for detailed views
- **Category Filtering**: Tab-based navigation system
- **Responsive Grid**: CSS Grid for destination layouts

### Backend Structure
- **RESTful API**: `/api/destinations` endpoints
- **Category Filtering**: Query parameter support (`?category=cafe&limit=6`)
- **Mock Data**: Comprehensive fallback data for all categories
- **CORS Enabled**: Cross-origin resource sharing configured
- **Static File Serving**: Express serves frontend files

### Data Organization
- **Categories**: `attraction`, `cafe`, `accommodation`, `restaurant`
- **Standardized Schema**: All destinations follow same data structure
- **Multilingual Support**: Thai primary, English fallback
- **Location Data**: Latitude/longitude for mapping
- **Rating System**: 5-star rating display

## File Responsibilities

### index.html
- Main application structure
- Thai language content
- Semantic HTML5 markup
- Accessibility considerations
- Font Awesome icons integration

### style.css
- CSS custom properties for theming
- Mobile-first responsive design
- Component-specific styling
- Animation and transition definitions
- Thai font (Kanit) integration

### script.js
- DOM manipulation and event handling
- Category filtering and display logic
- Modal management
- Navigation and slideshow functionality
- Weather widget integration

### api.js
- BuengkanAPI class for data management
- Google Places API integration
- Image API handling (Pixabay/Unsplash)
- Caching mechanism
- Fallback data definitions

### server.js
- Express.js server configuration
- API route definitions
- Static file serving
- CORS middleware
- Weather API proxy

## Naming Conventions
- **Files**: kebab-case for consistency
- **CSS Classes**: BEM methodology preferred
- **JavaScript**: camelCase for variables, PascalCase for classes
- **Thai Content**: Use appropriate Thai naming in comments and strings
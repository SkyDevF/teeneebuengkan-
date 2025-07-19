# Technology Stack & Development Guide

## Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js with Express.js
- **APIs**: Google Maps, OpenWeatherMap, Pixabay (for images)
- **Fonts**: Google Fonts (Kanit - Thai font)
- **Icons**: Font Awesome 6.0
- **Image Handling**: Local PNG files (1.png, 2.png, 3.png, 4.png) + external APIs

## Build System & Commands

### Development
```bash
npm run dev    # Start development server with nodemon
npm start      # Start production server
```

### Dependencies
- **Production**: express, cors
- **Development**: nodemon

## Code Style & Conventions

### Language Standards
- **Primary Language**: Thai (ภาษาไทย) for all user-facing content
- **Code Comments**: Thai language preferred for business logic
- **Variable Names**: English for technical variables, Thai for content

### CSS Architecture
- **CSS Custom Properties**: Use CSS variables defined in `:root`
- **Color Scheme**: Orange/yellow gradient theme (`--primary-color: #FF6B35`)
- **Typography**: Kanit font family for Thai text support
- **Responsive Design**: Mobile-first approach
- **Animations**: Smooth transitions (0.3s ease standard)

### JavaScript Patterns
- **ES6+**: Use modern JavaScript features
- **Async/Await**: Preferred over Promises for API calls
- **Class-based APIs**: Use classes for API management (BuengkanAPI)
- **Event Delegation**: Use for dynamic content
- **Error Handling**: Always include try-catch for API calls

### API Integration
- **Google Places API**: For real location data (requires API key)
- **Fallback Data**: Always provide mock data when APIs fail
- **Caching**: Implement Map-based caching for API responses
- **Rate Limiting**: Be mindful of API quotas

## File Organization
- Static assets in root directory
- API logic separated into dedicated files
- Modular JavaScript architecture
- CSS organized with clear sections and comments
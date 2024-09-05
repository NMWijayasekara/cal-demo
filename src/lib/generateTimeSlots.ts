export default function generateAvailableTimes(events, selectedEventId) {
    // Define the start and end time for the range (9 AM to 5 PM)
    const startTime = "09:00";
    const endTime = "17:00";
  
    // Find the selected event from the events array by ID
    const selectedEvent = events.find(event => event.id == selectedEventId);
  
    if (!selectedEvent) {
      throw new Error("Selected event not found.");
    }
  
    // Get the length of the selected event (in minutes)
    const eventLength = selectedEvent.length; // e.g., 15 for 15 minutes
  
    // Function to convert time string to minutes since midnight
    function timeToMinutes(time) {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    }
  
    // Function to convert minutes since midnight to time string
    function minutesToTime(minutes) {
      const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
      const mins = String(minutes % 60).padStart(2, "0");
      return `${hours}:${mins}`;
    }
  
    // Convert the start and end times to minutes since midnight
    let currentTime = timeToMinutes(startTime);
    const endTimeInMinutes = timeToMinutes(endTime);
  
    const timeSlots = [];
  
    // Generate the time slots
    while (currentTime + eventLength <= endTimeInMinutes) {
      const start = minutesToTime(currentTime);
      const end = minutesToTime(currentTime + eventLength);
      
      timeSlots.push({
        start,
        end
      });
  
      currentTime += eventLength;
    }
  
    return timeSlots;
  }
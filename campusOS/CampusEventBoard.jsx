const events = [
  { id: 'e1', title: "CS Dept Hackathon", fee: 0, isFull: false, attendees: 42 },
  { id: 'e2', title: "Debate Night", fee: 500, isFull: true, attendees: 120 },
  { id: 'e3', title: "Career Fair", fee: 0, isFull: false, attendees: 300 },
  { id: 'e4', title: "Movie Screening", fee: 200, isFull: false, attendees: 15 },
  { id: 'e5', title: "Coding Bootcamp", fee: 1000, isFull: true, attendees: 60 },
];

function EventCard({title, fee, isFull, attendees}){
   return(
     <div style={{backgroundColor: "#fff8e7", 
        padding: "16px", 
        borderRadius: "8px",
        border: "1px solid #ddd",
        margin: "10px"}}>
        <p>{title}</p>
        <p>{fee === 0 ? "free" : `₦${fee}` }</p>
        <p>{isFull ? "Full 🚫" : "Spots available ✅"}</p>
        <p>Attendees: {attendees}</p>
    </div>
   )
}
function EventList({events}){
    return(
        <div className="EventCard">
            {events.filter(event => !event.isFull)
            .map(event => (<EventCard key={event.id} title={event.title} fee={event.fee} isFull={event.isFull} attendees={event.attendees} />))}
        </div>
    )

}
function App(){
    return( 
        <EventList events={events} />
    )
}
export default App

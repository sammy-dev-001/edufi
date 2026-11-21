
const foodSpots = [
  { id: 'f1', name: "Iya Basira's Rice", price: 500, isOpen: true, rating: 4.5 },
  { id: 'f2', name: "Mama Put Amala", price: 700, isOpen: false, rating: 4.8 },
  { id: 'f3', name: "Suya Corner", price: 300, isOpen: true, rating: 4.2 },
  { id: 'f4', name: "Shawarma Spot", price: 1200, isOpen: true, rating: 4.0 },
  { id: 'f5', name: "Akara & Pap", price: 200, isOpen: false, rating: 3.9 },
];

function FoodCard({ name, price, isOpen, rating}) {
  return (
    <div style={{backgroundColor: "#fff8e7", 
        padding: "16px", 
        borderRadius: "8px",
        border: "1px solid #ddd",
        margin: "10px"}}>
      <p>{name}</p>
      <p>₦{price}</p>
      <p>{isOpen ? "open 🟢" : "closed 🔴"}</p>
      <p>rating: {rating}⭐</p>

    </div>

  )
}

    function FoodList ({foodSpots}) {
    return (
        <div className="FoodCard">
        { foodSpots.filter(food => food.price <= 600)
        .map(food => (<FoodCard key={food.id} name={food.name} price={food.price} isOpen={food.isOpen} rating={food.rating} />))}
        </div>
    )
    }
    function App() {
  
  return <FoodList foodSpots={foodSpots} />
}
   
export default App;

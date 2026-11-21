import React, { useState } from "react";
export default function HeightInput() {
    const [height, setHeight] = useState("")
    function handleChange(e) {
        setHeight(e.target.value)
    }
    return (
        <div>
            <input type="text" onChange={handleChange} value={height} />
            <p>your height is :{height}</p>
        </div>
    )
}

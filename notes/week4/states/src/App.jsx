import { useState } from 'react'



function App() {
    const [count, setCount] = useState(0)

    return (
        <>
            <h1>Count is {count}</h1>

            <button type="button" onClick={() => {
                setCount(count + 1)
            }}>Increment</button>
        </>
    )
}

export default App

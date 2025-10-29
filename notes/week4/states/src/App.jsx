import { useState } from 'react'



function App() {
    // const [count, setCount] = useState(0)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log("Name:", name)
        console.log("Email:", email)
        alert(`Form Submitted!\nName: ${name}\nEmail: ${email}`)
        setName('')
        setEmail('')
    }

    return (
        <>
            {/* <h1>Count is {count}</h1>

            <button type="button" onClick={() => {
                setCount(count + 1)
            }}>Increment</button> */}



            {/* Form Example*/}
            <form onSubmit={handleSubmit} className='m-4 p-4'>
                <input
                    type="text"
                    onChange={(e) => { setName(e.target.value) }}
                    placeholder='Name'
                    value={name}
                    className='my-4  border-gray border px-1 rounded'
                />

                <br />

                <input
                    type="email"
                    onChange={(e) => { setEmail(e.target.value) }}
                    placeholder='Email'
                    value={email}
                    className='my-4 border-gray border px-1 rounded'
                />

                <br />

                <button className='my-4 border-gray border rounded px-2' type="submit">Submit</button>


            </form>

        </>
    )
}

export default App

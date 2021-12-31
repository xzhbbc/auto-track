import React, { useEffect } from 'react'

const logFilter = 'test_logs'

const Index = () => {

    useEffect(() => {
        test()
    }, [])

    const test = () => {
        console.log('test')
    }
    
    const onClick = () => {
        console.log('click')
    }

    const open = () => {
        console.log('open')
    }

    return (
        <>
            <div onClick={onClick}>test</div>
            <div onClick={open}>open</div>
        </>
    )
}

export default Index
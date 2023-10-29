// 易错点1
// 现在要引入的包
import {createRoot} from 'react-dom/client'

// 易错点2
// 这行这里虽然没用上但是要加
import * as React from 'react'

export const App = () => {
    return (
        <>
            <div>
                hello world
            </div>
        </>
    )
}

const container = document.getElementById('root')
const root = createRoot(container)
// 易错点3
// 注意使用方式是<App>
root.render(<App />)

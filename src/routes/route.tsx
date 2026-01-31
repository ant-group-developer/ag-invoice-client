import { Navigate, Route, Routes } from 'react-router-dom'
import App from '../App'
import Home from '../pages/home'

export default function AppRoutes() {
  return (
    <Routes>
      <Route>
        <Route path='/' element={<App />}>
          <Route index element={<Navigate to='/home' replace />} />
          <Route key={'home'} path={'/home'} element={<Home />} />
          <Route key={'settings'} path={'/settings'} element={<div>Settings Page</div>} />
        </Route>
      </Route>
    </Routes>
  )
}

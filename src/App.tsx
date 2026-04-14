import { Navigate, Route, Routes } from 'react-router-dom'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { CharacterEditPage } from './pages/CharacterEditPage'
import { CharacterAbilitiesPrintPage } from './pages/CharacterAbilitiesPrintPage'
import { CharacterItemsPrintPage } from './pages/CharacterItemsPrintPage'
import { CharacterListPage } from './pages/CharacterListPage'
import { CharacterPrintPage } from './pages/CharacterPrintPage'

export default function App() {
  return (
    <>
      <LanguageSwitcher />
      <Routes>
        <Route path="/" element={<CharacterListPage />} />
        <Route path="/characters/:characterId/edit" element={<CharacterEditPage />} />
        <Route path="/characters/:characterId/print/abilities" element={<CharacterAbilitiesPrintPage />} />
        <Route path="/characters/:characterId/print/items" element={<CharacterItemsPrintPage />} />
        <Route path="/characters/:characterId/print" element={<CharacterPrintPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

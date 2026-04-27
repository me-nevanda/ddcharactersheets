import { Navigate, Route, Routes } from 'react-router-dom';
import { LanguageSwitcher } from '@components/LanguageSwitcher';
import { CharacterEditPage } from '@pages/CharacterEditPage';
import { CharacterListPage } from '@pages/CharacterListPage';
import { CharacterAbilitiesPrintPage } from '@pages/printPages/CharacterAbilitiesPrintPage';
import { CharacterItemsPrintPage } from '@pages/printPages/CharacterItemsPrintPage';
import { CharacterPrintPage } from '@pages/printPages/CharacterPrintPage';
const App = () => {
    return (<>
      <LanguageSwitcher />
      <Routes>
        <Route path="/" element={<CharacterListPage />}/>
        <Route path="/characters/:characterId/edit" element={<CharacterEditPage />}/>
        <Route path="/characters/:characterId/print/abilities" element={<CharacterAbilitiesPrintPage />}/>
        <Route path="/characters/:characterId/print/items" element={<CharacterItemsPrintPage />}/>
        <Route path="/characters/:characterId/print" element={<CharacterPrintPage />}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </>);
};
export default App;

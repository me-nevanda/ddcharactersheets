import { Navigate, Route, Routes } from 'react-router-dom';
import { LanguageSwitcher } from '@components/LanguageSwitcher';
import { AdventureEditPage } from '@pages/AdventureEditPage';
import { CharacterEditPage } from '@pages/CharacterEditPage';
import { MainPage } from '@pages/main';
import { MainPageProvider } from '@pages/main/mainPageContext';
import { MonsterEditPage } from '@pages/MonsterEditPage';
import { MonsterGroupEditPage } from '@pages/MonsterGroupEditPage';
import { CharacterAbilitiesPrintPage } from '@pages/printPages/CharacterAbilitiesPrintPage';
import { CharacterItemsPrintPage } from '@pages/printPages/CharacterItemsPrintPage';
import { CharacterPrintPage } from '@pages/printPages/CharacterPrintPage';
import { MonsterPrintPage } from '@pages/printPages/MonsterPrintPage';
const App = () => {
    return (<>
      <LanguageSwitcher />
      <MainPageProvider>
        <Routes>
          <Route path="/" element={<MainPage />}/>
          <Route path="/adventures/:adventureId/edit" element={<AdventureEditPage />}/>
          <Route path="/characters/:characterId/edit" element={<CharacterEditPage />}/>
          <Route path="/monsters/:monsterId/edit" element={<MonsterEditPage />}/>
          <Route path="/monster-groups/:groupId/edit" element={<MonsterGroupEditPage />}/>
          <Route path="/characters/:characterId/print/abilities" element={<CharacterAbilitiesPrintPage />}/>
          <Route path="/characters/:characterId/print/items" element={<CharacterItemsPrintPage />}/>
          <Route path="/characters/:characterId/print" element={<CharacterPrintPage />}/>
          <Route path="/monsters/:monsterId/print" element={<MonsterPrintPage />}/>
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </MainPageProvider>
    </>);
};
export default App;

import { Navigate, Route, Routes } from 'react-router-dom';
import { LanguageSwitcher } from '@components/LanguageSwitcher';
import { AdventureEditPage } from '@pages/AdventureEditPage';
import { CharacterEditPage } from '@pages/CharacterEditPage';
import { EventEditPage } from '@pages/EventEditPage';
import { MainPage } from '@pages/main';
import { MainPageProvider } from '@pages/main/mainPageContext';
import { MonsterEditPage } from '@pages/MonsterEditPage';
import { MonsterGroupEditPage } from '@pages/MonsterGroupEditPage';
import { NpcEditPage } from '@pages/NpcEditPage';
import { NpcGroupEditPage } from '@pages/NpcGroupEditPage';
import { PlaceEditPage } from '@pages/PlaceEditPage';
import { CharacterAbilitiesPrintPage } from '@pages/printPages/CharacterAbilitiesPrintPage';
import { CharacterItemsPrintPage } from '@pages/printPages/CharacterItemsPrintPage';
import { CharacterPrintPage } from '@pages/printPages/CharacterPrintPage';
import { MonsterPrintPage } from '@pages/printPages/MonsterPrintPage';
import { NpcPrintPage } from '@pages/printPages/NpcPrintPage';
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
          <Route path="/npcs/:npcId/edit" element={<NpcEditPage />}/>
          <Route path="/npc-groups/:groupId/edit" element={<NpcGroupEditPage />}/>
          <Route path="/places/:placeId/edit" element={<PlaceEditPage />}/>
          <Route path="/events/:eventId/edit" element={<EventEditPage />}/>
          <Route path="/characters/:characterId/print/abilities" element={<CharacterAbilitiesPrintPage />}/>
          <Route path="/characters/:characterId/print/items" element={<CharacterItemsPrintPage />}/>
          <Route path="/characters/:characterId/print" element={<CharacterPrintPage />}/>
          <Route path="/monsters/:monsterId/print" element={<MonsterPrintPage />}/>
          <Route path="/npcs/:npcId/print" element={<NpcPrintPage />}/>
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </MainPageProvider>
    </>);
};
export default App;

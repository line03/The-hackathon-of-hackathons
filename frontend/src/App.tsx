import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QuizCompletionProvider } from './contexts/QuizCompletionContext';
import WelcomePage from './pages/WelcomePage/WelcomePage';
import MapPage from './pages/MapPage/MapPage';
import TheatreWorldPage from './pages/MapPage/Theatre_World/page';
import GenderPage from './pages/MapPage/Theatre_World/Image_Theatre/Gender/page';
import GenderCorrectionPage from './pages/MapPage/Theatre_World/Image_Theatre/Gender/CorrectionPage';
import ImageTheatrePage from './pages/MapPage/Theatre_World/Image_Theatre/page';
import ImageTheatreCorrectionPage from './pages/MapPage/Theatre_World/Image_Theatre/CorrectionPage';
import DisabilityPage from './pages/MapPage/Theatre_World/Image_Theatre/Disability/page';
import DisabilityCorrectionPage from './pages/MapPage/Theatre_World/Image_Theatre/Disability/CorrectionPage';
import GamesPage from './pages/MapPage/Theatre_World/Games/page';
import GamesQuizPage from './pages/MapPage/Theatre_World/Games/QuizPage';
import ForumTheatrePage from './pages/MapPage/Theatre_World/ForumTheatre/page';
import ForumTheatreQuizPage from './pages/MapPage/Theatre_World/ForumTheatre/QuizPage';
import EducationPage from './pages/MapPage/Theatre_World/Image_Theatre/Education/page';
import EducationCorrectionPage from './pages/MapPage/Theatre_World/Image_Theatre/Education/CorrectionPage';
import SportsPage from './pages/MapPage/Theatre_World/Image_Theatre/Sports/page';
import SportsCorrectionPage from './pages/MapPage/Theatre_World/Image_Theatre/Sports/CorrectionPage';
import PressPage from './pages/MapPage/Theatre_World/Image_Theatre/Press/page';
import PressCorrectionPage from './pages/MapPage/Theatre_World/Image_Theatre/Press/CorrectionPage';
import PeaceAgendaPage from './pages/MapPage/Theatre_World/Image_Theatre/PeaceAgenda/page';
import PeaceAgendaCorrectionPage from './pages/MapPage/Theatre_World/Image_Theatre/PeaceAgenda/CorrectionPage';
import LawWorldPage from './pages/MapPage/Law_World/page';
import GeneralProvisionsPage from './pages/MapPage/Law_World/GeneralProvisions/page';
import GeneralProvisionsCorrectionPage from './pages/MapPage/Law_World/GeneralProvisions/CorrectionPage';
import GeneralProvisionsQuizPage from './pages/MapPage/Law_World/GeneralProvisions/QuizPage';
import CriminalizationPage from './pages/MapPage/Law_World/Criminalization/page';
import CriminalizationCorrectionPage from './pages/MapPage/Law_World/Criminalization/CorrectionPage';
import PolicyWorldPage from './pages/MapPage/Policy_World/page';
import KnowledgePage from './pages/MapPage/Policy_World/Knowledge/page';
import KnowledgeQuizPage from './pages/MapPage/Policy_World/Knowledge/QuizPage';
import DebatePage from './pages/MapPage/Policy_World/Debate/page';
import DebateCorrectionPage from './pages/MapPage/Policy_World/Debate/CorrectionPage';
import AcademiaPage from './pages/MapPage/Policy_World/Academia/page';
import Module1Page from './pages/MapPage/Policy_World/Academia/Module1/page';
import Module2Page from './pages/MapPage/Policy_World/Academia/Module2/page';
import Module3Page from './pages/MapPage/Policy_World/Academia/Module3/page';
import Module4Page from './pages/MapPage/Policy_World/Academia/Module4/page';
import {
  Module1CorrectionPage,
  Module2CorrectionPage,
  Module3CorrectionPage,
  Module4CorrectionPage,
} from './pages/MapPage/Policy_World/Academia/CorrectionPage';
import CallPage from './pages/Call/page';
import { ROUTES } from './config/routes';
import './App.css';

function App() {
  return (
    <QuizCompletionProvider>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.WELCOME} element={<WelcomePage />} />
          <Route path={ROUTES.MAP} element={<MapPage />} />
          <Route path={ROUTES.THEATRE_WORLD} element={<TheatreWorldPage />} />
          <Route path={ROUTES.THEATRE_WORLD_GENDER} element={<GenderPage />} />
          <Route path={ROUTES.THEATRE_WORLD_GENDER_CORRECTION} element={<GenderCorrectionPage />} />
          <Route path={ROUTES.THEATRE_WORLD_IMAGE_THEATRE} element={<ImageTheatrePage />} />
          <Route path={ROUTES.THEATRE_WORLD_IMAGE_THEATRE_CORRECTION} element={<ImageTheatreCorrectionPage />} />
          <Route path={ROUTES.THEATRE_WORLD_DISABILITY} element={<DisabilityPage />} />
          <Route path={ROUTES.THEATRE_WORLD_DISABILITY_CORRECTION} element={<DisabilityCorrectionPage />} />
          <Route path={ROUTES.THEATRE_WORLD_GAMES} element={<GamesPage />} />
          <Route path={ROUTES.THEATRE_WORLD_GAMES_QUIZ} element={<GamesQuizPage />} />
          <Route path={ROUTES.THEATRE_WORLD_FORUM} element={<ForumTheatrePage />} />
          <Route path={ROUTES.THEATRE_WORLD_FORUM_QUIZ} element={<ForumTheatreQuizPage />} />
          <Route path={ROUTES.THEATRE_WORLD_IMAGE_THEATRE_EDUCATION} element={<EducationPage />} />
          <Route path={ROUTES.THEATRE_WORLD_IMAGE_THEATRE_EDUCATION_CORRECTION} element={<EducationCorrectionPage />} />
          <Route path={ROUTES.THEATRE_WORLD_IMAGE_THEATRE_SPORTS} element={<SportsPage />} />
          <Route path={ROUTES.THEATRE_WORLD_IMAGE_THEATRE_SPORTS_CORRECTION} element={<SportsCorrectionPage />} />
          <Route path={ROUTES.THEATRE_WORLD_IMAGE_THEATRE_PRESS} element={<PressPage />} />
          <Route path={ROUTES.THEATRE_WORLD_IMAGE_THEATRE_PRESS_CORRECTION} element={<PressCorrectionPage />} />
          <Route path={ROUTES.THEATRE_WORLD_IMAGE_THEATRE_PEACE_AGENDA} element={<PeaceAgendaPage />} />
          <Route path={ROUTES.THEATRE_WORLD_IMAGE_THEATRE_PEACE_AGENDA_CORRECTION} element={<PeaceAgendaCorrectionPage />} />
          <Route path={ROUTES.LAW_WORLD} element={<LawWorldPage />} />
          <Route path={ROUTES.LAW_WORLD_GENERAL_PROVISIONS} element={<GeneralProvisionsPage />} />
          <Route path={ROUTES.LAW_WORLD_GENERAL_PROVISIONS_QUIZ} element={<GeneralProvisionsQuizPage />} />
          <Route path={ROUTES.LAW_WORLD_GENERAL_PROVISIONS_CORRECTION} element={<GeneralProvisionsCorrectionPage />} />
          <Route path={ROUTES.LAW_WORLD_CRIMINALIZATION} element={<CriminalizationPage />} />
          <Route path={ROUTES.LAW_WORLD_CRIMINALIZATION_CORRECTION} element={<CriminalizationCorrectionPage />} />
          <Route path={ROUTES.POLICY_WORLD} element={<PolicyWorldPage />} />
          <Route path={ROUTES.POLICY_WORLD_KNOWLEDGE} element={<KnowledgePage />} />
          <Route path={ROUTES.POLICY_WORLD_KNOWLEDGE_QUIZ} element={<KnowledgeQuizPage />} />
          <Route path={ROUTES.POLICY_WORLD_DEBATE} element={<DebatePage />} />
          <Route path={ROUTES.POLICY_WORLD_DEBATE_CORRECTION} element={<DebateCorrectionPage />} />
          <Route path={ROUTES.POLICY_WORLD_ACADEMIA} element={<AcademiaPage />} />
          <Route path={ROUTES.POLICY_WORLD_ACADEMIA_MODULE_1} element={<Module1Page />} />
          <Route path={ROUTES.POLICY_WORLD_ACADEMIA_MODULE_1_CORRECTION} element={<Module1CorrectionPage />} />
          <Route path={ROUTES.POLICY_WORLD_ACADEMIA_MODULE_2} element={<Module2Page />} />
          <Route path={ROUTES.POLICY_WORLD_ACADEMIA_MODULE_2_CORRECTION} element={<Module2CorrectionPage />} />
          <Route path={ROUTES.POLICY_WORLD_ACADEMIA_MODULE_3} element={<Module3Page />} />
          <Route path={ROUTES.POLICY_WORLD_ACADEMIA_MODULE_3_CORRECTION} element={<Module3CorrectionPage />} />
          <Route path={ROUTES.POLICY_WORLD_ACADEMIA_MODULE_4} element={<Module4Page />} />
          <Route path={ROUTES.POLICY_WORLD_ACADEMIA_MODULE_4_CORRECTION} element={<Module4CorrectionPage />} />
          <Route path={ROUTES.CALL} element={<CallPage />} />
        </Routes>
      </BrowserRouter>
    </QuizCompletionProvider>
  );
}

export default App;


import React from 'react';
import VoiceCall from '../../components/Media/media';

import Header from '../../layouts/Header';

const CallPage: React.FC = () => {
  return (
    <>
      <Header showUserInfo={true} />
      <VoiceCall />
    </>
  );
};

export default CallPage;
import React from 'react';
import MailsList from './MailsList';
import MailDetail from './MailDetail';
import AppsContainer from '@crema/components/AppsContainer';
import MailSidebar from './MailSideBar';
import { useIntl } from 'react-intl';
import AppPageMeta from '@crema/components/AppPageMeta';
import { useRouter } from 'next/router';
import MailContextProvider from '../context/MailContextProvider';

const Mail = () => {
  const { query } = useRouter();

  const onGetMainComponent = () => {
    if (query?.all?.[2]) {
      return <MailDetail />;
    } else {
      return <MailsList />;
    }
  };

  const { messages } = useIntl();
  return (
    <MailContextProvider>
      <AppsContainer
        title={messages['mailApp.mail'] as string}
        sidebarContent={<MailSidebar />}
      >
        <AppPageMeta title="Mail App" />
        {onGetMainComponent()}
      </AppsContainer>
    </MailContextProvider>
  );
};

export default Mail;

import type { GetServerSideProps } from "next";
import { PreferencesScreen } from "@/components/notifications/preferences-screen";
import { requireSession } from "@/auth/guards";

export const getServerSideProps: GetServerSideProps = requireSession;

export default PreferencesScreen;

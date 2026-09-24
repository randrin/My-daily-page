import type { GetServerSideProps } from "next";
import { CategoriesScreen } from "@/components/categories/categories-screen";
import { requireSession } from "@/auth/guards";

export const getServerSideProps: GetServerSideProps = requireSession;

export default CategoriesScreen;

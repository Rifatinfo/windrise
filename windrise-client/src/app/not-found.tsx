import { NotFound } from "@/components/modules/not-found/NotFound";

const NotFoundPage = () => {
  // NotFound already fills the screen (min-h-screen w-full); no wrapper.
  return <NotFound />;
};

export default NotFoundPage;
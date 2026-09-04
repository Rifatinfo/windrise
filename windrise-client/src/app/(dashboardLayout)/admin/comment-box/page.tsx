import type { Metadata } from "next";

import { CommentBox } from "@/components/modules/moderation/CommentBox";

export const metadata: Metadata = {
  title: "Comment Box | Windrise",
  description: "Product reviews and blog comments, with delete control.",
};

const CommentBoxPage = () => <CommentBox />;

export default CommentBoxPage;

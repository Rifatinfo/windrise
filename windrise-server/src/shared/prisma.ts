// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient({
//   log:
//     process.env.NODE_ENV === "development"
//       ? ["query", "error", "warn"]
//       : ["error"],
// });

// export default prisma;

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString =
  "postgresql://neondb_owner:npg_HXz9xI6ihsJW@ep-curly-cherry-amw6y7td-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

console.log("DB --", connectionString);

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({
  adapter,
});

export default prisma;

// import { PrismaPg } from "@prisma/adapter-pg";
// import { PrismaClient } from "./generated/prisma/client";

// const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// export const prisma = new PrismaClient({ adapter });
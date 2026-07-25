-- AddForeignKey
ALTER TABLE "shop_managers" ADD CONSTRAINT "shop_managers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

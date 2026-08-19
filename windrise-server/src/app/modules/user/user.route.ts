import express from "express";

import { UserController } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "@/app/utils/fileUploader";
import { UserValidation } from "./user.validation";

const router = express.Router();

/* ===============================================
 ====================== Customer Created ============
 ============================================== */

router.post(
    "/create-customer",
    fileUploader.singleUpload("file"),
    (req, _res, next) => {
        try {
            if (!req.body?.data) {
                throw new Error("Customer data missing");
            }

            const parsed = JSON.parse(req.body.data);
            req.body = UserValidation.createUserValidationSchema.parse(parsed);

            next();
        } catch (error) {
            next(error);
        }
    },
    UserController.createCustomer
);

/* ===============================================
 ====================== Admin Created ============
 ============================================== */
router.post(
    "/create-admin",
    fileUploader.singleUpload("file"),
    (req, _res, next) => {
        try {
            if (!req.body?.data) {
                throw new Error("Admin data missing");
            }

            const parsed = JSON.parse(req.body.data);
            req.body = UserValidation.createAdminValidationSchema.parse(parsed);

            next();
        } catch (error) {
            next(error);
        }
    },
    UserController.createAdmin
);


router.get("/",   UserController.getAllFromDB);

/* ===============================================
 ============ Self-service profile edit ==========
 Must stay above "/:id" or Express matches that first.
 ============================================== */
router.patch(
    "/me",
    auth(
        UserRole.ADMIN,
        UserRole.SHOP_MANAGER,
        UserRole.MEDIA_MANAGER,
        UserRole.CUSTOMER,
    ),
    fileUploader.singleUpload("file"),
    (req, _res, next) => {
        try {
            const parsed = req.body?.data ? JSON.parse(req.body.data) : {};
            req.body = UserValidation.updateMyProfileValidationSchema.parse(parsed);
            next();
        } catch (error) {
            next(error);
        }
    },
    UserController.updateMyProfile
);

router.patch(
    "/:id",
    auth(UserRole.ADMIN),
    fileUploader.singleUpload("file"),
    (req, _res, next) => {
        try {
            if (!req.body?.data) {
                throw new Error("Update data missing");
            }

            const parsed = JSON.parse(req.body.data);
            req.body = UserValidation.updateAdminValidationSchema.parse(parsed);

            next();
        } catch (error) {
            next(error);
        }
    },
    UserController.updateAdmin
);

router.patch(
    "/:id/status",
    auth(UserRole.ADMIN),
    (req, _res, next) => {
        try {
            req.body = UserValidation.updateAdminStatusValidationSchema.parse(req.body);
            next();
        } catch (error) {
            next(error);
        }
    },
    UserController.updateAdminStatus
);

router.delete(
    "/:id",
    auth(UserRole.ADMIN),
    UserController.deleteAdmin
);

export const UserRoutes = router;
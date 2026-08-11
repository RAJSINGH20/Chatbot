import { Router } from "express";
import {
    Registration,
    Login,
    Chat,
    getChats,
} from "../Controller/user.controller.js";

const router = Router();

router.post("/Registration", Registration);
router.post("/login", Login);
router.post("/chat", Chat);

router.get("/chats", getChats);

export default router;
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
router.post("/chat", Chat);  // creating a new chats

router.get("/chats", getChats);  // Show the Exsisting Chats

export default router;
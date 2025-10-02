import express from "express";
import prismaClient from "../../db/db";

const router = express.Router();

interface ProfileInput {
  id: number;
  name?: string;
  password?: string;
}

router.post("/update-profile", async (req, res) => {
  try {
    const inputData: ProfileInput = req.body;

    const data = {
      ...(inputData.name && { name: inputData.name }),
      ...(inputData.password && { password: inputData.password }),
    };

    
    const updatedUser = await prismaClient.user.update({
        where: {
            id: inputData.id,
        },
        data: data
    });

    res.status(200).send(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
    console.error(`Failed to update Profile data: `, err);
  }
});

export default router;
import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.ts";

const app = express();
const PORT = 3001;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

app.use(cors());

//This middleware lets our server understand JSON sent in requests.
app.use(express.json());

//READ: get all tasks
app.get("/tasks", async (req, res) => {
    const tasks = await prisma.task.findMany({ orderBy: { id: "asc"} });
    res.json(tasks);
});

// CREATE:  add a task
app.post("/tasks", async (req, res) => {
    const newTask = await prisma.task.create({
        data: { title: req.body.title },
    });
    res.status(201).json(newTask);
});

// UPDATE: change a task
app.put("/tasks/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
        const updated = await prisma.task.update({
            where: { id },
            data: {
                title: req.body.title,
                done: req.body.done,
            },
        });
        res.json(updated);
    } catch (err) {
        res.status(404).json({ error: "Task not found" });
    }
});

// DELETE: remove a task
app.delete("/tasks/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
        await prisma.task.delete({ where: { id } });
        res.status(204).send();
    } catch (err) {
        res.status(404).json({ error: "Task not found"});
    }
});

// On Vercel the function is invoked directly, so we must NOT call listen().
// Locally (no VERCEL env var) we start a normal server for development.
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

export default app;
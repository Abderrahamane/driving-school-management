import Lesson from "../models/lesson.model.js";

export const getLessons = async (req, res) => {
    const lessons = await Lesson.find();
    res.json(lessons);
};

export const addLesson = async (req, res) => {
    const newLesson = new Lesson(req.body);
    await newLesson.save();
    res.json(newLesson);
};

export const updateLesson = async (req, res) => {
    const updated = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
};

export const deleteLesson = async (req, res) => {
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ message: "Lesson deleted" });
};

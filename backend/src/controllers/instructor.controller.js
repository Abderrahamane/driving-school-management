import Instructor from "../models/instructor.model.js";

export const getInstructors = async (req, res) => {
    const instructors = await Instructor.find();
    res.json(instructors);
};

export const addInstructor = async (req, res) => {
    const newInstructor = new Instructor(req.body);
    await newInstructor.save();
    res.json(newInstructor);
};

export const updateInstructor = async (req, res) => {
    const updated = await Instructor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
};

export const deleteInstructor = async (req, res) => {
    await Instructor.findByIdAndDelete(req.params.id);
    res.json({ message: "Instructor deleted" });
};

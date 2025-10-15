import Student from "../models/student.model.js";

export const getStudents = async (req, res) => {
    const students = await Student.find();
    res.json(students);
};

export const addStudent = async (req, res) => {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.json(newStudent);
};

export const updateStudent = async (req, res) => {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
};

export const deleteStudent = async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted" });
};

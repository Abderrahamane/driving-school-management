import Vehicle from "../models/vehicle.model.js";

export const getVehicles = async (req, res) => {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
};

export const addVehicle = async (req, res) => {
    const newVehicle = new Vehicle(req.body);
    await newVehicle.save();
    res.json(newVehicle);
};

export const updateVehicle = async (req, res) => {
    const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
};

export const deleteVehicle = async (req, res) => {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: "Vehicle deleted" });
};
